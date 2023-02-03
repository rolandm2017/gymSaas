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
const tryCatchClassDecorator_1 = require("../../util/tryCatchClassDecorator");
const City_1 = require("../models/City");
let CityDAO = class CityDAO {
    constructor() { }
    createCity(city) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield City_1.City.create(city);
        });
    }
    getAllCities() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield City_1.City.findAll({});
        });
    }
    getMultipleCities(limit, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield City_1.City.findAndCountAll({ offset, limit });
        });
    }
    getCityById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield City_1.City.findByPk(id);
        });
    }
    getCityByName(cityName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield City_1.City.findOne({
                where: {
                    cityName: cityName,
                },
            });
        });
    }
    updateCity(city, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const affected = yield City_1.City.update(city, { where: { cityId: id } });
            return affected[0];
        });
    }
    deleteCity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield City_1.City.destroy({ where: { cityId: id } });
        });
    }
};
CityDAO = __decorate([
    (0, tryCatchClassDecorator_1.TryCatchClassDecorator)(Error, (err, context) => {
        console.log(context, err);
        throw err;
    })
], CityDAO);
exports.default = CityDAO;
