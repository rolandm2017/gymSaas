"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBulkURLs = exports.removeUrl = void 0;
const agreementType_enum_1 = require("../enum/agreementType.enum");
const buildingType_enum_1 = require("../enum/buildingType.enum");
function removeUrl(housing) {
    if (housing.agreementType !== agreementType_enum_1.AgreementTypeEnum.rent && housing.agreementType !== agreementType_enum_1.AgreementTypeEnum.buy) {
        housing.agreementType = agreementType_enum_1.AgreementTypeEnum.unknown;
    }
    if (housing.buildingType !== buildingType_enum_1.BuildingTypeEnum.apartment && housing.buildingType !== buildingType_enum_1.BuildingTypeEnum.house) {
        housing.buildingType = buildingType_enum_1.BuildingTypeEnum.unknown;
    }
    const withoutUrl = {
        housingId: housing.housingId,
        buildingType: housing.buildingType,
        agreementType: housing.agreementType,
        address: housing.address,
        cityId: housing.cityId,
        stateId: housing.stateId,
        price: housing.price,
        phone: "",
        lat: housing.lat,
        long: housing.long,
        source: housing.source,
        nearAGym: housing.nearAGym,
        distanceToNearestGym: housing.distanceToNearestGym,
    };
    return withoutUrl;
}
exports.removeUrl = removeUrl;
function removeBulkURLs(housings) {
    return housings.map(h => removeUrl(h));
}
exports.removeBulkURLs = removeBulkURLs;
