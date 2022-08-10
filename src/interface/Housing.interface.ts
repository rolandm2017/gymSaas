import { Provider } from "../enum/provider.enum";

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
    source: Provider;
    // TODO: consider adding "availability"
}
