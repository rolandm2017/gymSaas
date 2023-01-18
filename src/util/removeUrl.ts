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
    const withoutUrl: IHousing = { ...housing };
    return withoutUrl;
}
