import { ProviderEnum } from "../enum/provider.enum";
import { IAssociation } from "./Association.interface";

export interface IHousing {
    type: "apartment" | "house";
    agreement: "rent" | "buy";
    address?: string;
    city?: string;
    state?: string;
    price?: number;
    phone?: string;
    url?: string;
    lat: number;
    long: number;
    source: ProviderEnum;
    nearbyGyms?: IAssociation[];
    // TODO: consider adding "availability"
}
