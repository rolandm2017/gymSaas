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
exports.convertHousingToHousingWithUrl = exports.convertHousingsToDemoHousings = exports.convertIHousingToCreationAttr = void 0;
const conversions_1 = require("./conversions");
const convertGymModelToIGym_1 = require("./convertGymModelToIGym");
function convertIHousingToCreationAttr(house, provider, taskId, cityId, batchNum) {
    const creationPayload = {
        buildingType: house.buildingType,
        agreementType: house.agreementType,
        address: house.address !== undefined ? house.address : "unknown",
        state: house.state,
        price: house.price !== undefined ? house.price : 0,
        source: provider,
        url: house.url !== undefined ? house.url : "",
        lat: house.lat,
        long: house.long,
        idAtSource: house.idAtSource ? house.idAtSource : 0,
        taskId,
        cityId,
        batchId: batchNum,
        nearAGym: house.nearAGym !== undefined ? house.nearAGym : null,
        distanceToNearestGym: house.distanceToNearestGym,
    };
    return creationPayload;
}
exports.convertIHousingToCreationAttr = convertIHousingToCreationAttr;
function convertHousingsToDemoHousings(housings, gymDAO) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const demoHousings = [];
        for (const housing of housings) {
            const nearbyGyms = yield gymDAO.getGymsNear(housing.lat, housing.long);
            const distances = nearbyGyms.map((gym, index) => {
                const distance = (0, conversions_1.convertLatLongDifferenceIntoKM)(housing.lat, housing.long, gym.lat, gym.long);
                return { distance, index };
            });
            const smallestDistanceIndex = (_a = distances.find(el => el.distance)) === null || _a === void 0 ? void 0 : _a.index;
            if (smallestDistanceIndex === undefined)
                throw Error("Will never happen error");
            const nearestGym = nearbyGyms[smallestDistanceIndex];
            const demoContent = {
                housingId: housing.housingId,
                buildingType: housing.buildingType == "apartment" ? housing.buildingType : "house",
                agreementType: housing.agreementType == "rent" ? housing.agreementType : "buy",
                lat: housing.lat,
                long: housing.long,
                nearAGym: housing.nearAGym,
                distanceToNearestGym: housing.distanceToNearestGym,
                nearbyGym: (0, convertGymModelToIGym_1.convertGymModelToIGym)(nearestGym, "irrelevant"),
            };
            demoHousings.push(demoContent);
        }
        return demoHousings;
    });
}
exports.convertHousingsToDemoHousings = convertHousingsToDemoHousings;
function convertHousingToHousingWithUrl(housing) {
    // primarily used to remove the "Housing_Reveals" part that causes TypeError: Converting circular structure to JSON
    const housingWithUrl = {
        housingId: housing.housingId,
        buildingType: housing.buildingType == "apartment" ? housing.buildingType : "house",
        agreementType: housing.agreementType == "rent" ? housing.agreementType : "buy",
        address: housing.address,
        lat: housing.lat,
        long: housing.long,
        nearAGym: housing.nearAGym,
        url: housing.url,
        source: housing.source,
        distanceToNearestGym: housing.distanceToNearestGym,
    };
    return housingWithUrl;
}
exports.convertHousingToHousingWithUrl = convertHousingToHousingWithUrl;
