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
exports.setCityId = exports.getCityIdFromCacheElseDb = exports._cityIdCache = void 0;
exports._cityIdCache = new Map();
// const cityDAO = new CityDAO();
function getCityIdFromCacheElseDb(cityName, cityDAO) {
    return __awaiter(this, void 0, void 0, function* () {
        const idIfExists = exports._cityIdCache.get(cityName);
        if (idIfExists) {
            console.log("Used city id cache");
            return idIfExists;
        }
        const cityEntry = yield cityDAO.getCityByName(cityName);
        if (cityEntry === null)
            throw new Error("City not yet defined in db");
        const cityId = cityEntry.cityId;
        exports._cityIdCache.set(cityName, cityId);
        return cityId;
    });
}
exports.getCityIdFromCacheElseDb = getCityIdFromCacheElseDb;
function setCityId(cityName, cityId) {
    return __awaiter(this, void 0, void 0, function* () {
        exports._cityIdCache.set(cityName, cityId);
    });
}
exports.setCityId = setCityId;
