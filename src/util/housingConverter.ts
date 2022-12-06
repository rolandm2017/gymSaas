import { Housing, HousingCreationAttributes } from "../database/models/Housing";
import { ProviderEnum } from "../enum/provider.enum";
import { IDemoHousing } from "../interface/DemoHousing.interface";
import { IHousing } from "../interface/Housing.interface";

export function convertIHousingToCreationAttr(
    house: IHousing,
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
        };
        demoHousings.push(demoContent);
    }
    return demoHousings;
}
