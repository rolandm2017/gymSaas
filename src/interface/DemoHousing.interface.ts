import { ProviderEnum } from "../enum/provider.enum";
import { IAssociation } from "./Association.interface";

export interface IDemoHousing {
    housingId?: number; // same property name as in db
    buildingType: "apartment" | "house";
    agreementType: "rent" | "buy";
    // address?: string; // not included in demo!
    cityName?: string;
    stateName?: string;
    // url?: string; // not included in demo!
    lat: number;
    long: number;
    // source: ProviderEnum; // not included in demo!
    nearbyGyms?: IAssociation[];
    // idAtSource?: number; // for the id as detected at the provider. used in RentCanada to scrape apartment URL
    nearAGym?: boolean | null;
}
