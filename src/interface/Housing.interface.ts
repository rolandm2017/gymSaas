import { AgreementTypeEnum } from "../enum/agreementType.enum";
import { BuildingTypeEnum } from "../enum/buildingType.enum";
import { ProviderEnum } from "../enum/provider.enum";
import { IAssociation } from "./Association.interface";

export interface IHousing {
    housingId?: number; // same property name as in db
    buildingType: string;
    agreementType: string;
    address?: string;
    cityName?: string;
    state?: string;
    price?: number;
    phone?: string;
    // url?: string; // this does not belong in plain 'ihousing" because it's paywalled
    lat: number;
    long: number;
    source: string;
    nearbyGyms?: IAssociation[];
    idAtSource?: number | null; // for the id as detected at the provider. used in RentCanada to scrape apartment URL
    nearAGym?: boolean | null;
}
