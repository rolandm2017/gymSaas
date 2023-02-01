import { Housing, HousingCreationAttributes } from "../database/models/Housing";
import { ProviderEnum } from "../enum/provider.enum";
import { IDemoHousing } from "../interface/DemoHousing.interface";
import { IHousing } from "../interface/Housing.interface";
import { IHousingWithUrl } from "../interface/HousingWithUrl.interface";

export function convertIHousingToCreationAttr(
    house: IHousingWithUrl,
    provider: ProviderEnum,
    taskId: number,
    cityId: number,
    batchNum: number,
): HousingCreationAttributes {
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
        idAtSource: house.idAtSource ? house.idAtSource : 0, // 0 for "nonexistent"
        taskId,
        cityId,
        batchId: batchNum,
        nearAGym: house.nearAGym !== undefined ? house.nearAGym : null,
    };
    return creationPayload;
}

export function convertHousingsToDemoHousings(housings: Housing[]): IDemoHousing[] {
    const demoHousings: IDemoHousing[] = [];
    for (const housing of housings) {
        const demoContent: IDemoHousing = {
            housingId: housing.housingId,
            buildingType: housing.buildingType == "apartment" ? housing.buildingType : "house",
            agreementType: housing.agreementType == "rent" ? housing.agreementType : "buy",
            lat: housing.lat,
            long: housing.long,
            nearAGym: housing.nearAGym,
            distanceToNearestGym: housing.distanceToNearestGym,
        };
        demoHousings.push(demoContent);
    }
    return demoHousings;
}

export function convertHousingToHousingWithUrl(housing: Housing): IHousingWithUrl {
    // primarily used to remove the "Housing_Reveals" part that causes TypeError: Converting circular structure to JSON
    const housingWithUrl: IHousingWithUrl = {
        housingId: housing.housingId,
        buildingType: housing.buildingType == "apartment" ? housing.buildingType : "house",
        agreementType: housing.agreementType == "rent" ? housing.agreementType : "buy",
        address: housing.address,
        lat: housing.lat,
        long: housing.long,
        nearAGym: housing.nearAGym,
        url: housing.url,
        source: housing.source,
    };
    return housingWithUrl;
}
