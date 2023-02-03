"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const sequelize_1 = require("sequelize");
const acceptableRadiusForWalking_1 = require("../../util/acceptableRadiusForWalking");
const tryCatchClassDecorator_1 = require("../../util/tryCatchClassDecorator");
const Gym_1 = require("../models/Gym");
let GymDAO = class GymDAO {
    constructor() { }
    createGym(gym) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Gym_1.Gym.create(gym);
        });
    }
    getGymByGymId(gymId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Gym_1.Gym.findByPk(gymId);
        });
    }
    getGymByAddress(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Gym_1.Gym.findAll({ where: { address } });
        });
    }
    getEntriesWithNullCityId() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Gym_1.Gym.findAll({ where: { cityId: null } });
        });
    }
    getMultipleGyms(cityName, limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Gym_1.Gym.findAndCountAll({ where: { cityName }, limit, offset });
        });
    }
    getAllGyms() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Gym_1.Gym.findAll({});
        });
    }
    getGymsNear(lat, long) {
        return __awaiter(this, void 0, void 0, function* () {
            const lowerLimitLatitude = lat - acceptableRadiusForWalking_1.MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
            const upperLimitLatitude = lat + acceptableRadiusForWalking_1.MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
            const lowerLimitLongitude = long - acceptableRadiusForWalking_1.MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
            const upperLimitLongitude = long + acceptableRadiusForWalking_1.MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
            return yield Gym_1.Gym.findAll({
                where: {
                    lat: {
                        [sequelize_1.Op.between]: [lowerLimitLatitude, upperLimitLatitude],
                    },
                    long: {
                        [sequelize_1.Op.between]: [lowerLimitLongitude, upperLimitLongitude],
                    },
                },
            });
        });
    }
    // update
    addCityIdToGyms(entriesToCorrect, missingCityId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gymIdsToCorrect = entriesToCorrect.map(gym => gym.gymId);
            const updatedGyms = yield Gym_1.Gym.update({ cityId: missingCityId }, { where: { gymId: gymIdsToCorrect } });
            return updatedGyms[0];
        });
    }
    deleteAllGyms() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Gym_1.Gym.destroy({ where: {} });
        });
    }
};
GymDAO = __decorate([
    (0, tryCatchClassDecorator_1.TryCatchClassDecorator)(Error, (err, context) => {
        console.log(context, err);
        throw err;
    })
], GymDAO);
exports.default = GymDAO;
