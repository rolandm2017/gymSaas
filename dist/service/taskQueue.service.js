"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const provider_enum_1 = require("../enum/provider.enum");
const parser_1 = __importDefault(require("../scrapers/parser"));
const housingConverter_1 = require("../util/housingConverter");
const constants_1 = require("../util/constants");
const cityName_enum_1 = require("../enum/cityName.enum");
const applySuccessFilter_1 = require("../util/applySuccessFilter");
class TaskQueueService {
    constructor(housingDAO, taskDAO, cityDAO, batchDAO, cacheService) {
        this.housingDAO = housingDAO;
        this.taskDAO = taskDAO;
        this.cityDAO = cityDAO;
        this.batchDAO = batchDAO;
        this.cacheService = cacheService;
    }
    queueGridScan(provider, coords, zoomWidth, cityName, batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            // todo: low priority - caching the batch num to cut read/write in half
            // const cachedNums = await this.cacheService.addBatchNumIfNotExists(batchNum);
            const all = yield this.batchDAO.getAllBatchNums();
            const alreadyWritten = all.includes(batchNum);
            if (!alreadyWritten) {
                yield this.batchDAO.addBatchNum(batchNum);
            }
            // step 3: fwd the grid coords to the scraper along with the bounds.
            // the scraper will scan every subdivision of the grid and report back its results.
            const correspondingCityId = yield this.cacheService.getCityId(cityName);
            // "temp" bandaid
            let successes = 0;
            try {
                for (let i = 0; i < coords.length; i++) {
                    yield this.taskDAO.createTask({
                        providerName: provider,
                        lat: coords[i].lat,
                        long: coords[i].long,
                        zoomWidth,
                        lastScan: null,
                        batchId: batchNum,
                        cityId: correspondingCityId,
                        ignore: false,
                    });
                    successes++;
                }
            }
            catch (err) {
                console.log(err);
                throw err;
            }
            const results = {
                pass: successes,
                fail: coords.length - successes,
                batchNum,
            };
            return results;
        });
    }
    // SINGLE
    getNextTaskForScraper(provider, batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.taskDAO.getNextUnfinishedTaskForProvider(provider, batchNum);
        });
    }
    // PLURAL, note the plural!!
    getNextTasksForScraper(provider, batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.taskDAO.getAllUnfinishedTasksForProvider(provider, batchNum);
            return tasks;
        });
    }
    getTasksByWithSpecifications(batchNum, cityName, provider, successFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            // **
            // ** If anyone is reading this, and knows how to clean up this gong show of logic forks, please tell me.
            // **
            // handle case where cityName is "all"
            const cityNameInputIsAll = cityName === "all";
            if (cityNameInputIsAll) {
                //
                const correspondingCities = yield this.cityDAO.getAllCities();
                if (correspondingCities.length === 0)
                    throw Error("Unexpected failure from no cities retrieved");
                if (provider === provider_enum_1.ProviderEnumOrAll.all) {
                    // all providers, all cities
                    const tasks = yield this.taskDAO.getTasksByBatchNum(batchNum);
                    return (0, applySuccessFilter_1.applySuccessFilter)(tasks, successFilter);
                }
                // by specific batch num and provider now
                const tasks = yield this.taskDAO.getTasksByBatchNumAndProvider(batchNum, provider);
                return (0, applySuccessFilter_1.applySuccessFilter)(tasks, successFilter);
            }
            // **
            // handle case where cityName is not all and is a valid city name
            const allValidCities = Object.values(cityName_enum_1.CityNameEnum);
            const cityNameIsASpecificCity = allValidCities.includes(cityName);
            if (cityNameIsASpecificCity) {
                //
                const correspondingCity = yield this.cityDAO.getCityByName(cityName);
                if (correspondingCity === null)
                    throw Error("Invalid city name");
                if (provider === provider_enum_1.ProviderEnumOrAll.all) {
                    const tasks = yield this.taskDAO.getTasksByBatchNumAndCityId(batchNum, correspondingCity.cityId);
                    return (0, applySuccessFilter_1.applySuccessFilter)(tasks, successFilter);
                }
                // by specific provider, cityname, batch num
                const tasks = yield this.taskDAO.getTasksByBatchNumAndCityIdAndProvider(batchNum, correspondingCity.cityId, provider);
                return (0, applySuccessFilter_1.applySuccessFilter)(tasks, successFilter);
            }
            // **
            // handle case where cityName is not all and is overall invalid
            const invalidCityName = true; // it must be false because otherwise the prev 2 conditions would've handled it.
            return [];
        });
    }
    reportFindingsToDb(provider, taskId, apartments, reportedCityId, // optional param enables tests to bypass getting the cityId from the Task, which might not exist in testing
    batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            const parser = new parser_1.default(provider);
            const parsedApartmentData = parser.parse(apartments);
            // console.log(`adding ${parsedApartmentData.length} apartments`);
            let successes = 0;
            // get city id for this task because its needed in the housing model for foreign key
            const currentTask = yield this.taskDAO.getTaskById(taskId);
            if (currentTask === null) {
                throw new Error("Orphaned task discovered");
            }
            const cityId = reportedCityId ? reportedCityId : currentTask.cityId;
            const batchId = batchNum ? batchNum : currentTask.batchId;
            // update task's lastScan date
            yield this.taskDAO.updateLastScanDate(currentTask, new Date());
            // mark it ignored if there are too few results to repeat it
            const tooFewApartmentsToContinueScrape = parsedApartmentData.length < constants_1.MIN_SCRAPES_FOR_REPEAT_SCRAPE;
            if (tooFewApartmentsToContinueScrape) {
                console.log(`Marking ignored for task with id ${taskId}`);
                yield this.taskDAO.markIgnored(currentTask);
                if (parsedApartmentData.length === 0) {
                    return { pass: 0, fail: 0 };
                }
            }
            // add apartments
            console.log(`adding ${parsedApartmentData.length} apartments`);
            try {
                for (const apartment of parsedApartmentData) {
                    const apartmentCreationPayload = (0, housingConverter_1.convertIHousingToCreationAttr)(apartment, provider, taskId, cityId, batchId);
                    // solution to race condition on housing id assignment during scraping
                    // Without this line, Sequelize will try to write more than 1 record at a time per housingId.
                    apartmentCreationPayload.housingId = this.cacheService.getNextHousingId();
                    yield this.housingDAO.createHousing(apartmentCreationPayload);
                    successes++;
                }
            }
            catch (err) {
                console.log(err);
                throw err;
            }
            const results = {
                pass: successes,
                fail: parsedApartmentData.length - successes,
            };
            return results;
        });
    }
    markTaskComplete(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = yield this.taskDAO.getTaskById(taskId);
            if (task === null) {
                return false;
            }
            task.lastScan = new Date();
            yield this.taskDAO.updateTask(task, taskId);
            return true;
        });
    }
    getAllTasks(choice, batchId, cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const all = yield this.taskDAO.getAllTasks(choice, batchId, cityId);
            return all;
        });
    }
    getScorecard(forProvider, batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            const allTasks = yield this.taskDAO.getScorecard(forProvider, batchNum);
            const complete = allTasks.filter(t => t.lastScan !== null);
            const incomplete = allTasks.filter(t => t.lastScan === null);
            return { complete, incomplete, completeTotal: complete.length, incompleteTotal: incomplete.length };
        });
    }
    getAllBatchNumbers() {
        return __awaiter(this, void 0, void 0, function* () {
            // FIXME: cache service (low priority)
            // const batches = await this.cacheService.getAllBatchNums();
            const batches = yield this.batchDAO.getAllBatchNums();
            return batches;
        });
    }
    countComplete(tasks) {
        // const now = new Date();
        // const thirtyDaysAgo = new Date();
        // thirtyDaysAgo.setDate(now.getDate() - COMPLETE_TASK_TIME_THRESHOLD_IN_DAYS);
        const complete = tasks.filter((task) => task.lastScan !== null);
        const incomplete = tasks.length - complete.length;
        return { complete: complete.length, incomplete };
    }
    cleanSpecific(bySpecificTaskIds, byRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedTaskIds = [];
            let toDelete = [];
            // this is mostly to prevent ts from yelling about "maybe undefined!"
            const probablyUsingByRange = Array.isArray(bySpecificTaskIds) && bySpecificTaskIds.length === 0;
            const definitelyUsingByRange = Array.isArray(byRange); // this is mostly to satisfy TS
            if (probablyUsingByRange && definitelyUsingByRange) {
                for (let i = byRange[0]; i < byRange[1]; i++) {
                    toDelete.push(i);
                }
            }
            else if (Array.isArray(bySpecificTaskIds)) {
                toDelete = bySpecificTaskIds;
            }
            else {
                throw new Error("input validation failed");
            }
            // loop over them and delete
            for (const taskId of toDelete) {
                try {
                    yield this.taskDAO.deleteTask(taskId);
                    deletedTaskIds.push(taskId);
                }
                catch (err) {
                    console.log(err);
                    console.log(taskId + " failed to delete; perhaps it doesn't exist?");
                }
            }
            return deletedTaskIds;
        });
    }
    emptyBatchNums() {
        return __awaiter(this, void 0, void 0, function* () {
            const deleted = yield this.batchDAO.deleteAll();
            return deleted;
        });
    }
    cleanAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const numberOfDeletedRows = yield this.taskDAO.deleteAll();
            return numberOfDeletedRows;
        });
    }
    cleanOldTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.taskDAO.deleteTasksOlderThanTwoMonths();
        });
    }
}
exports.default = TaskQueueService;
