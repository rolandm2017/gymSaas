import { HousingCreationAttributes } from "../database/models/Housing";
import { ProviderEnum } from "../enum/provider.enum";
import { IHousing } from "../interface/Housing.interface";

export function convertIHousingToCreationAttr(house: IHousing, provider: ProviderEnum): HousingCreationAttributes {
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
        idAtSource: house.idAtSource,
    };
    return creationPayload;
}
