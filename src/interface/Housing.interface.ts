import { ProviderEnum } from "../enum/provider.enum";
import { IAssociation } from "./Association.interface";

export interface IHousing {
    housingId?: number; // same property name as in db
    buildingType: "apartment" | "house";
    agreementType: "rent" | "buy";
    address?: string;
    cityName?: string;
    state?: string;
    price?: number;
    phone?: string;
    url?: string;
    lat: number;
    long: number;
    source: ProviderEnum;
    nearbyGyms?: IAssociation[];
    idAtSource?: number; // for the id as detected at the provider. used in RentCanada to scrape apartment URL
    nearAGym?: boolean | null;
}
