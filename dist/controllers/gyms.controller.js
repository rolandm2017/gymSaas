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
const stateName_enum_1 = require("../enum/stateName.enum");
const handleErrorResponse_1 = require("../util/handleErrorResponse");
const inputValidation_1 = require("../validationSchemas/inputValidation");
class GymsController {
    constructor(gymService) {
        this.path = "/google";
        this.router = express_1.default.Router();
        this.gymService = gymService;
        this.router.get("/gyms", this.getGymsFromGoogle.bind(this));
        this.router.get("/saved", this.getSavedGymsFromDB.bind(this));
        this.router.post("/add-city-id", this.addCityIdWhereMissing.bind(this));
        this.router.get("/count", this.countGymsByCity.bind(this));
        this.router.get("/all", this.getAllGyms.bind(this));
        this.router.delete("/all", this.deleteAll.bind(this));
    }
    getGymsFromGoogle(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cityName = request.query.cityName;
                const stateOrProvince = request.query.state;
                const country = request.query.country;
                // validation
                if (typeof cityName !== "string" || typeof stateOrProvince !== "string" || typeof country !== "string") {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "Parameter missing or isn't string");
                }
                const legitCityName = Object.values(cityName_enum_1.CityNameEnum).some(name => name == cityName);
                if (!legitCityName)
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "cityName was not legit");
                const legitStateName = Object.values(stateName_enum_1.StateNamesEnum).some(name => name == stateOrProvince);
                if (!legitStateName)
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "state was not legit");
                //
                const gyms = yield this.gymService.findGymsInLocation(country, stateOrProvince, cityName);
                const saved = yield this.gymService.saveGyms(gyms, cityName);
                return response.status(200).json({ gyms, saved });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getSavedGymsFromDB(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cityNameInput = request.query.cityName;
                const cityName = (0, inputValidation_1.isString)(cityNameInput);
                const gymsFromDB = yield this.gymService.getSavedGymsFromDB(cityName);
                return response.status(200).json(gymsFromDB);
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    addCityIdWhereMissing(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const correctedGyms = yield this.gymService.correctNullEntries();
                return response.status(200).json({ correctedGyms });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    countGymsByCity(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const countedByCity = yield this.gymService.countGymsByCity();
                return response.status(200).json({ countedByCity });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getAllGyms(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gyms = yield this.gymService.getAllGyms();
                return response.status(200).json({ gyms });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    deleteAll(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const affected = yield this.gymService.deleteAll();
                return response.status(200).json({ message: `Deleted ${affected} gyms in the db` });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
}
exports.default = GymsController;
