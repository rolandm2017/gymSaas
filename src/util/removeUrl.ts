import { Housing } from "../database/models/Housing";
import { AgreementTypeEnum } from "../enum/agreementType.enum";
import { BuildingTypeEnum } from "../enum/buildingType.enum";
import { IHousing } from "../interface/Housing.interface";
import { IHousingWithUrl } from "../interface/HousingWithUrl.interface";

export function removeUrl(housing: Housing): IHousing {
    if (housing.agreementType !== AgreementTypeEnum.rent && housing.agreementType !== AgreementTypeEnum.buy) {
        housing.agreementType = AgreementTypeEnum.unknown;
    }
    if (housing.buildingType !== BuildingTypeEnum.apartment && housing.buildingType !== BuildingTypeEnum.house) {
        housing.buildingType = BuildingTypeEnum.unknown;
    }
    const withoutUrl: IHousing = {
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
    };
    return withoutUrl;
}

export function removeBulkURLs(housings: Housing[]): IHousing[] {
    return housings.map(h => removeUrl(h));
}
