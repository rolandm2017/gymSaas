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
const express_1 = __importDefault(require("express"));
const handleErrorResponse_1 = require("../util/handleErrorResponse");
const healthCheck_enum_1 = require("../enum/healthCheck.enum");
const inputValidation_1 = require("../validationSchemas/inputValidation");
const authorize_middleware_1 = __importDefault(require("../middleware/authorize.middleware"));
const role_enum_1 = require("../enum/role.enum");
// do I need a "scraper controller" and a separate "task queue controller"?
class TaskQueueController {
    // todo in production: mark several routes "admin only" like this: authorize([Role.Admin])
    constructor(taskQueueService, scraperService, cacheService) {
        this.path = "/task-queue";
        this.router = express_1.default.Router();
        this.taskQueueService = taskQueueService;
        this.scraperService = scraperService;
        this.cacheService = cacheService;
        // step 2 of 3 in queuing a scrape
        this.router.post("/plan-grid-scan", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.getGridForScan.bind(this));
        // step 3 of 3 in queuing a scrape
        // this.router.post("/queue-grid-scan", authorize([Role.Admin]), this.addGridScanToQueue.bind(this)); // admin only
        this.router.post("/queue-grid-scan", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.addGridScanToQueue.bind(this)); // admin only
        // stuff (separate from the 3 step queuing)
        this.router.get("/scrape", this.scrapeApartments.bind(this));
        this.router.get("/next-batch-number", this.getNextBatchNumber.bind(this));
        this.router.get("/next-tasks-for-scraper", this.getNextTasksForScraper.bind(this));
        // step 3.5
        this.router.post("/report-findings-and-mark-complete", this.reportFindingsToDbAndMarkComplete.bind(this));
        // used to check tasks make sense
        this.router.get("/all", this.getAllTasks.bind(this));
        this.router.get("/scorecard", this.getScorecard.bind(this));
        this.router.delete("/cleanup", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.cleanOldTasks.bind(this));
        this.router.delete("/batch-nums", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.emptyBatchNums.bind(this));
        this.router.delete("/by-id", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.cleanSpecific.bind(this));
        this.router.delete("/all", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.cleanAll.bind(this));
        this.router.get(healthCheck_enum_1.HealthCheck.healthCheck, this.healthCheck.bind(this));
    }
    scrapeApartments(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const city = request.body.city;
                const stateOrProvince = request.body.state;
                const country = request.body.country;
                const providerInput = request.body.provider;
                const provider = (0, inputValidation_1.isProvider)(providerInput);
                const aps = yield this.scraperService.scrapeApartments(provider, city, stateOrProvince, country);
                return response.json({ aps });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getNextBatchNumber(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const highest = yield this.cacheService.getBatchNumForNewBatches();
                if (highest >= 0) {
                    return response.status(200).json({ nextBatchNum: highest });
                }
                // this only happens once
                this.cacheService.setBatchNumForNewBatches(0);
                return response.status(200).json({ nextBatchNum: 0 });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getGridForScan(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startCoords = request.body.startCoords;
                const bounds = request.body.bounds;
                const radius = request.body.radius;
                // Not doing input validation here. It will fail fine + validation would be a gong show.
                const gridCoords = yield this.scraperService.planGrid(startCoords, bounds, radius);
                return response.status(200).json({ gridCoords });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    addGridScanToQueue(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providerInput = request.body.provider;
                const coords = request.body.coords;
                const zoomWidthInput = request.body.zoomWidth;
                const cityNameInput = request.body.cityName;
                const batchNumInput = request.body.batchNum; // admin should have gotten this from the previous endpoint
                const provider = (0, inputValidation_1.isProvider)(providerInput);
                if (!Array.isArray(coords) || coords.length === 0) {
                    // not doing more validation.
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "Invalid coords input");
                }
                const zoomWidth = (0, inputValidation_1.isInteger)(zoomWidthInput);
                const batchNum = (0, inputValidation_1.isInteger)(batchNumInput);
                const legitCityName = (0, inputValidation_1.isLegitCityName)(cityNameInput);
                if (!legitCityName)
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "cityName was not legit");
                const queued = yield this.taskQueueService.queueGridScan(provider, coords, zoomWidth, legitCityName, batchNum);
                return response.status(200).json({ queued: queued });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getNextTasksForScraper(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const providerInput = request.body.provider;
            const batchNum = request.body.batchNum; // MIGHT need batch number, but also might not!
            try {
                // Currently batchNum is an OPTIONAL parameter!
                // If specified: Get that batch's unfinished tasks for provider.
                // If not specified: Get ALL unfinished tasks for provider.
                const provider = (0, inputValidation_1.isProvider)(providerInput);
                const tasks = yield this.taskQueueService.getNextTasksForScraper(provider, batchNum);
                return response.status(200).json({ tasks });
            }
            catch (err) {
                console.log({ providerInput, batchNum });
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    reportFindingsToDbAndMarkComplete(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // this is coming from the scraper so, no validation here!
                const forProvider = request.body.provider;
                const taskId = request.body.taskId;
                const apartments = request.body.apartments;
                const cityId = request.body.cityId;
                const batchNum = request.body.batchNum;
                if (typeof taskId !== "number" || taskId < 0) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "Bad task ID input");
                }
                const successfullyLogged = yield this.taskQueueService.reportFindingsToDb(forProvider, taskId, apartments, cityId, batchNum);
                const markedComplete = yield this.taskQueueService.markTaskComplete(taskId);
                return response.status(200).json({ successfullyLogged, markedComplete, taskId });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getAllTasks(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const byProviderInput = request.body.provider; // provider only should work.
                const byBatchNumInput = request.body.batchNum; // batchNum only should work.
                // submitting neither should work; "get all, I really mean ALL"
                const byProvider = byProviderInput ? (0, inputValidation_1.isProvider)(byProviderInput) : undefined;
                const byBatchNum = byBatchNumInput ? (0, inputValidation_1.isStringInteger)(byBatchNumInput) : undefined;
                const onlyCount = request.query.onlyCount;
                const tasks = yield this.taskQueueService.getAllTasks(byProvider, byBatchNum, undefined);
                const { complete, incomplete } = this.taskQueueService.countComplete(tasks);
                if (onlyCount)
                    return response.status(200).json({ count: tasks.length, complete, incomplete });
                return response.status(200).json({ tasks, count: tasks.length, complete, incomplete });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getScorecard(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const byProviderInput = request.body.provider; // provider only should work.
                const byBatchNumInput = request.body.batchNum; // batchNum only should work.
                const byProvider = (0, inputValidation_1.isProvider)(byProviderInput);
                const byBatchNum = (0, inputValidation_1.isInteger)(byBatchNumInput);
                const scorecard = yield this.taskQueueService.getScorecard(byProvider, byBatchNum);
                return response.status(200).json(Object.assign({}, scorecard));
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    cleanSpecific(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bySpecificTaskIds = request.body.toDelete;
                const byRange = [request.body.start, request.body.end];
                // validation
                const usingByArray = Array.isArray(bySpecificTaskIds) && bySpecificTaskIds.every((i) => typeof i === "number" && i >= 0);
                const usingByRange = typeof request.body.start === "number" && typeof request.body.end === "number" && byRange[0] < byRange[1];
                if (!usingByArray && !usingByRange)
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "bad inputs");
                // service
                const deletedTaskIds = yield this.taskQueueService.cleanSpecific(bySpecificTaskIds, byRange);
                return response.status(200).json({ deletedTaskIds });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    cleanAll(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedRows = yield this.taskQueueService.cleanAll();
            return response.status(200).json({ message: `Deleted ${deletedRows} rows in the task queue` });
        });
    }
    emptyBatchNums(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleted = yield this.taskQueueService.emptyBatchNums();
            return response.status(200).json({ message: `Deleted ${deleted} batch nums` });
        });
    }
    cleanOldTasks(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const deleted = yield this.taskQueueService.cleanOldTasks();
            return response.status(200).json({ deleted });
        });
    }
    healthCheck(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            return response.status(200).json({ status: "Online" });
        });
    }
}
exports.default = TaskQueueController;
