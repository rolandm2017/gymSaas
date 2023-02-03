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
const cityName_enum_1 = require("../enum/cityName.enum");
const handleErrorResponse_1 = require("../util/handleErrorResponse");
const healthCheck_enum_1 = require("../enum/healthCheck.enum");
const inputValidation_1 = require("../validationSchemas/inputValidation");
const housingSchemas_1 = require("../validationSchemas/housingSchemas");
const authorize_middleware_1 = __importDefault(require("../middleware/authorize.middleware"));
const role_enum_1 = require("../enum/role.enum");
class HousingController {
    constructor(housingService, scraperService) {
        this.path = "/housing";
        this.router = express_1.default.Router();
        this.housingService = housingService;
        this.scraperService = scraperService;
        // step 1 of 3 in queuing a scrape
        this.router.post("/viewport-width", housingSchemas_1.detectViewportWidthSchema, this.detectProviderViewportWidth.bind(this));
        // public endpoint for demo
        this.router.get("/demo", this.getDemoContent.bind(this));
        // user queries
        this.router.get("/real-url/:apartmentid", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), this.getRealURL.bind(this));
        this.router.get("/real-url-list", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), this.getRevealedRealUrlList.bind(this));
        this.router.get("/search", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), housingSchemas_1.searchQuerySchema, this.searchQuery.bind(this));
        // this.router.get("/saved", this.getSavedApartmentsByLocation.bind(this));
        // this.router.get("/location", authorize([Role.User]), this.getSavedApartmentsByLocation.bind(this));
        this.router.get("/by-location", this.getScrapedApartmentsByLocation.bind(this));
        this.router.get("/qualified/by-location", this.getQualifiedApartmentsByLocation.bind(this));
        this.router.get("/all", this.getAllApartments.bind(this));
        // "/delete-all" so "get all" and "delete all" don't have the same route with a different verb.
        // prevents accidental deletion.
        this.router.delete("/delete-all", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.deleteAllApartments.bind(this));
        // admin ish stuff
        this.router.get("/by-city-id-and-batch-id", housingSchemas_1.getHousingByCityIdAndBatchNumSchema, this.getHousingByCityIdAndBatchNum.bind(this));
        // step 4 of queuing a scrape - for after the scrape of the city is done
        this.router.get("/qualify", this.qualifyScrapedApartments.bind(this));
        // step 5 of queuing a scrape - for after the apartments have been qualified
        this.router.delete("/unqualified", this.deleteUnqualifiedApartments.bind(this));
        // step 6 of queuing a scrape - add the distances
        this.router.get("/add-distances", this.addDistances.bind(this));
        this.router.get(healthCheck_enum_1.HealthCheck.healthCheck, this.healthCheck);
        // this.router.post("/task", this.queueScrape);
    }
    getDemoContent(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const neLatInput = request.query.neLat;
                const neLongInput = request.query.neLong;
                const swLatInput = request.query.swLat;
                const swLongInput = request.query.swLong;
                const neLat = (0, inputValidation_1.isStringFloat)(neLatInput); // max lat
                const neLong = (0, inputValidation_1.isStringFloat)(neLongInput); // max long
                const swLat = (0, inputValidation_1.isStringFloat)(swLatInput); // min lat
                const swLong = (0, inputValidation_1.isStringFloat)(swLongInput); // min long
                // console.log("Lat min, lat max", swLat, neLat);
                // console.log("Long min, long max", swLong, neLong);
                const isGiantSquare = this.housingService.confirmIsGiantSquare(swLat, neLat, swLong, neLong);
                if (!isGiantSquare) {
                    return response.status(400).json({ message: "No negative area squares" });
                }
                const demoContent = yield this.housingService.getDemoHousing(swLat, neLat, swLong, neLong);
                return response.status(200).json({ demoContent });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    detectProviderViewportWidth(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const city = request.body.city;
                const stateOrProvince = request.body.state;
                const providerInput = request.body.provider;
                const zoomWidthInput = request.body.zoomWidth;
                const provider = (0, inputValidation_1.isProvider)(providerInput); // throws if invalid
                const dimensions = yield this.scraperService.detectProviderViewportWidth(provider, city, stateOrProvince, zoomWidthInput);
                return response.status(200).json(dimensions);
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getHousingByCityIdAndBatchNum(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const byBatchNum = request.body.batchNum;
                const byCityId = request.body.cityId;
                const housing = yield this.housingService.getHousingByCityIdAndBatchNum(byCityId, byBatchNum);
                return response.status(200).json({ housing });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getScrapedApartmentsByLocation(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cityIdInput = request.query.cityId;
                const cityNameInput = request.query.cityName;
                const stateOrProvinceInput = request.query.state;
                // validation
                // Note it could be an invalid state/province but, not checking that. It could just fail.
                const stateOrProvince = stateOrProvinceInput ? (0, inputValidation_1.isString)(stateOrProvinceInput) : undefined;
                const legitCityName = cityNameInput ? (0, inputValidation_1.isLegitCityName)(cityNameInput) : undefined;
                const cityId = cityIdInput ? (0, inputValidation_1.isStringInteger)(cityIdInput) : undefined;
                const apartments = yield this.housingService.getAllHousing(cityId, legitCityName, stateOrProvince);
                return response.status(200).json({ apartments, count: apartments.length });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getQualifiedApartmentsByLocation(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cityIdInput = request.query.cityId;
                const cityId = (0, inputValidation_1.isStringInteger)(cityIdInput);
                const apartments = yield this.housingService.getQualifiedAps(cityId);
                return response.status(200).json({ apartments, count: apartments.length });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getRealURL(request, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.acctId;
                if (userId === undefined) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "No user defined on request");
                }
                const apartmentIdInput = request.params.apartmentid;
                const apartmentId = (0, inputValidation_1.isStringInteger)(apartmentIdInput);
                const serviceResponse = yield this.housingService.getRealURL(apartmentId, userId);
                if (serviceResponse === "Dead link detected") {
                    return response.status(500).json({ serviceResponse, success: false });
                }
                if (serviceResponse === "No credits available") {
                    return response.status(400).json({ serviceResponse, success: false });
                }
                return response.status(200).json({ apartmentId, realURL: serviceResponse, success: true });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getRevealedRealUrlList(request, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //
                const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.acctId;
                if (userId === undefined) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "No user defined on request");
                }
                const revealedURLs = yield this.housingService.getRevealedRealUrlList(userId);
                return response.status(200).json({ revealedURLs });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    searchQuery(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const cityNameInput = request.query.cityName;
            const minDistanceInput = request.query.minDistance;
            const maxDistanceInput = request.query.maxDistance;
            const pageNumInput = request.query.pageNum;
            try {
                const cityName = (0, inputValidation_1.isLegitCityName)(cityNameInput);
                const minDist = (0, inputValidation_1.isStringFloat)(minDistanceInput);
                const maxDist = (0, inputValidation_1.isStringFloat)(maxDistanceInput);
                const pageNum = (0, inputValidation_1.isStringInteger)(pageNumInput);
                const { results, totalPages } = yield this.housingService.getUsingSearchQuery(cityName, minDist, maxDist, pageNum);
                return response.status(200).json({ pageNum, results, totalPages });
            }
            catch (err) {
                console.log({ cityNameInput, minDistanceInput, maxDistanceInput, pageNumInput });
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getAllApartments(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            // Really: "Get ALL." Intended to be used by tests and admin to inspect stuff.
            try {
                const justCount = request.query.justCount;
                const apartments = yield this.housingService.getAllHousing();
                if (justCount)
                    return response.status(200).json({ length: apartments.length });
                return response.status(200).json({ apartments, length: apartments.length });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    addDistances(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            //
            const distances = yield this.housingService.addDistances();
            return response.status(200).json({ message: "done", distances });
        });
    }
    deleteAllApartments(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const affected = yield this.housingService.deleteAllHousing();
                return response.status(200).json({ message: `Deleted ${affected} rows in the task queue` });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    qualifyScrapedApartments(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cityName = request.query.cityName;
                if (typeof cityName !== "string")
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "cityName must be string");
                const legitCityName = Object.values(cityName_enum_1.CityNameEnum).some(name => name == cityName);
                if (!legitCityName)
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "cityName was not legit");
                const details = yield this.housingService.qualifyScrapedApartments(cityName);
                return response.status(200).json({ qualified: details.qualified, outOf: details.total, percent: details.qualified / details.total });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    deleteUnqualifiedApartments(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cityName = request.query.cityName;
                if (typeof cityName !== "string")
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "cityName must be string");
                const legitCityName = Object.values(cityName_enum_1.CityNameEnum).some(name => name == cityName);
                if (!legitCityName)
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "cityName was not legit");
                const numberOfDeleted = yield this.housingService.deleteUnqualifiedApartments(cityName);
                return response.status(200).json({ numberOfDeleted });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    healthCheck(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            return response.status(200).json({ message: "Online" });
        });
    }
}
exports.default = HousingController;
