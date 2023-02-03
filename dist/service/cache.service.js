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
Object.defineProperty(exports, "__esModule", { value: true });
const cityIdCache_1 = require("../database/cache/cityIdCache");
const batchNumCache_1 = require("../database/cache/batchNumCache");
const questionsCache_1 = require("../database/cache/questionsCache");
const housingIdCache_1 = require("../database/cache/housingIdCache");
class CacheService {
    constructor(cityDAO, batchDAO, feedbackDAO) {
        this.cityDAO = cityDAO;
        this.batchDAO = batchDAO;
        this.feedbackDAO = feedbackDAO;
    }
    // city id stuff
    getCityId(city) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, cityIdCache_1.getCityIdFromCacheElseDb)(city, this.cityDAO);
        });
    }
    setCityId(cityName, cityId) {
        (0, cityIdCache_1.setCityId)(cityName, cityId);
    }
    // batch num stuff
    getBatchNumForNewBatches() {
        return __awaiter(this, void 0, void 0, function* () {
            // returns highest available number.
            return yield (0, batchNumCache_1.getBatchNumForNewBatches)(this.batchDAO);
        });
    }
    getAllBatchNums() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, batchNumCache_1.getAllBatchNums)();
        });
    }
    setBatchNumForNewBatches(newNum) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, batchNumCache_1.setBatchNumForNewBatches)(newNum, this.batchDAO);
        });
    }
    addBatchNumIfNotExists(newNum) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, batchNumCache_1.addBatchNumIfNotExists)(newNum, this.batchDAO);
        });
    }
    clearBatchCache() {
        (0, batchNumCache_1.resetBatchCache)();
    }
    // housing id stuff
    getNextHousingId() {
        // solution to race condition on housing id assignment during scraping
        const next = (0, housingIdCache_1.readNextHousingId)();
        (0, housingIdCache_1.incrementHousingId)();
        return next;
    }
    initHousingId(current) {
        (0, housingIdCache_1.setHousingIdFromDb)(current);
    }
    // feedback stuff
    getCurrentQuestions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, questionsCache_1.getQuestions)();
        });
    }
    // init functions for when the server restarts
    initQuestionsCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const questions = yield this.feedbackDAO.readLatest();
            if (questions === null) {
                throw new Error("No questions found");
            }
            (0, questionsCache_1.setQuestionOne)(questions.questionOne);
            (0, questionsCache_1.setQuestionTwo)(questions.questionTwo);
            (0, questionsCache_1.setQuestionThree)(questions.questionThree);
        });
    }
    initBatchCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const batchNums = yield this.batchDAO.getAllBatchNums();
            (0, batchNumCache_1.initBatchCacheFromDb)(batchNums);
        });
    }
    initCityIdCache() {
        return __awaiter(this, void 0, void 0, function* () {
            const cities = yield this.cityDAO.getAllCities();
            const namesAndIds = cities.map(city => {
                return {
                    cityName: city.cityName,
                    cityId: city.cityId,
                };
            });
            for (const city of namesAndIds) {
                (0, cityIdCache_1.setCityId)(city.cityName, city.cityId);
            }
        });
    }
}
exports.default = CacheService;
