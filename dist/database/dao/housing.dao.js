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
const Housing_1 = require("../models/Housing");
const tryCatchClassDecorator_1 = require("../../util/tryCatchClassDecorator");
const constants_1 = require("../../util/constants");
let HousingDAO = class HousingDAO {
    constructor(stateDAO, cityDAO) {
        this.stateDAO = stateDAO;
        this.cityDAO = cityDAO;
    }
    createHousing(housing) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.create(Object.assign({}, housing));
        });
    }
    countHousingsInCity(cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.count({ where: { cityId } });
        });
    }
    // read section
    getHighestHousingId() {
        return __awaiter(this, void 0, void 0, function* () {
            const highest = yield Housing_1.Housing.max("housingId");
            if (Number(highest) === highest) {
                return highest;
            }
            throw Error("Got something other than a number from housing id");
        });
    }
    getMultipleHousings(limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            if (limit === undefined && offset === undefined)
                return yield Housing_1.Housing.findAndCountAll({ where: {} });
            return yield Housing_1.Housing.findAndCountAll({ offset, limit });
        });
    }
    getHousingByHousingId(housingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.findByPk(housingId);
        });
    }
    getAllHousingJustByCityId(cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.findAll({ where: { cityId } });
        });
    }
    getAllHousing(cityId, cityName, stateOrProvince) {
        return __awaiter(this, void 0, void 0, function* () {
            if ([cityId, cityName, stateOrProvince].every(arg => arg === undefined))
                return yield Housing_1.Housing.findAll({});
            let conditions;
            let state;
            if (stateOrProvince) {
                state = yield this.stateDAO.getStateByName(stateOrProvince);
                if (state === null || undefined)
                    return [];
            }
            if (cityId && stateOrProvince) {
                if (!state)
                    return [];
                conditions = { cityId, stateId: state.stateId };
            }
            else if (cityName && stateOrProvince) {
                const city = yield this.cityDAO.getCityByName(cityName);
                if (city === null)
                    return [];
                if (!state)
                    return [];
                conditions = { cityId: city.cityId, stateId: state.stateId };
            }
            else if (stateOrProvince) {
                if (!state)
                    return [];
                conditions = { stateId: state.stateId };
            }
            else if (cityId) {
                conditions = { cityId };
            }
            else {
                conditions = {};
            }
            return yield Housing_1.Housing.findAll({ where: conditions });
        });
    }
    getQualifiedHousing(cityId, cityName, stateOrProvince) {
        return __awaiter(this, void 0, void 0, function* () {
            if ([cityId, cityName, stateOrProvince].every(arg => arg === undefined))
                return yield Housing_1.Housing.findAll({});
            let conditions;
            let state;
            if (stateOrProvince) {
                state = yield this.stateDAO.getStateByName(stateOrProvince);
                if (state === null || undefined)
                    return [];
            }
            if (cityId && stateOrProvince) {
                if (!state)
                    return [];
                conditions = { cityId, stateId: state.stateId };
            }
            else if (cityName && stateOrProvince) {
                const city = yield this.cityDAO.getCityByName(cityName);
                if (city === null)
                    return [];
                if (!state)
                    return [];
                conditions = { cityId: city.cityId, stateId: state.stateId };
            }
            else if (stateOrProvince) {
                if (!state)
                    return [];
                conditions = { stateId: state.stateId };
            }
            else if (cityId) {
                conditions = { cityId };
            }
            else {
                conditions = {};
            }
            return yield Housing_1.Housing.findAll({ where: conditions });
        });
    }
    getHousingByCityIdAndBatchNum(cityId, batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.findAll({ where: { cityId, batchId: batchNum } });
        });
    }
    getApartmentsByLocation(cityName) {
        return __awaiter(this, void 0, void 0, function* () {
            const city = cityName ? yield this.cityDAO.getCityByName(cityName) : null;
            if (city === null)
                return [];
            return yield Housing_1.Housing.findAll({ where: { cityId: city.cityId } });
        });
    }
    getUsingSearchQuery(cityId, minDist, maxDist, pageNum) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.findAll({
                where: {
                    cityId,
                    distanceToNearestGym: {
                        [sequelize_1.Op.between]: [minDist, maxDist],
                    },
                },
                order: [["distanceToNearestGym", "ASC"]],
                limit: constants_1.RESULTS_PER_PAGE,
                offset: pageNum * constants_1.RESULTS_PER_PAGE,
            });
        });
    }
    getCountOfSearchQuery(cityId, minDist, maxDist) {
        return __awaiter(this, void 0, void 0, function* () {
            const all = yield Housing_1.Housing.findAll({
                where: {
                    cityId,
                    distanceToNearestGym: {
                        [sequelize_1.Op.between]: [minDist, maxDist],
                    },
                },
                order: [["distanceToNearestGym", "ASC"]],
            });
            return all.length / constants_1.RESULTS_PER_PAGE;
        });
    }
    readBetween(lowerLimitLatitude, upperLimitLatitude, lowerLimitLongitude, upperLimitLongitude) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.findAll({
                where: {
                    lat: {
                        [sequelize_1.Op.between]: [lowerLimitLatitude, upperLimitLatitude],
                    },
                    long: {
                        [sequelize_1.Op.between]: [lowerLimitLongitude, upperLimitLongitude], // -30, -40
                    },
                },
            });
        });
    }
    // update section
    updateHousing(housing, housingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.update(housing, { where: { housingId } });
        });
    }
    addUrlToHousing(housingId, url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.update({ url }, { where: { housingId } });
        });
    }
    markQualified(cityId, lowerLimitLatitude, upperLimitLatitude, lowerLimitLongitude, upperLimitLongitude) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.update({ nearAGym: true }, // "qualified"
            {
                where: {
                    cityId: cityId,
                    lat: {
                        [sequelize_1.Op.between]: [lowerLimitLatitude, upperLimitLatitude],
                    },
                    long: {
                        [sequelize_1.Op.between]: [lowerLimitLongitude, upperLimitLongitude], // -30, -40
                    },
                    nearAGym: null,
                },
            });
        });
    }
    // delete section
    deleteUnqualifiedHousingByCityId(cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.destroy({
                where: {
                    cityId,
                    nearAGym: null,
                },
            });
        });
    }
    deleteHousingByHousingId(housingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.destroy({ where: { housingId } });
        });
    }
    deleteAllHousing() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Housing_1.Housing.destroy({ where: {} });
        });
    }
};
HousingDAO = __decorate([
    (0, tryCatchClassDecorator_1.TryCatchClassDecorator)(Error, (err, context) => {
        console.log(context, err);
        throw err;
    })
], HousingDAO);
exports.default = HousingDAO;
