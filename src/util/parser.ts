import { Provider } from "../enum/provider.enum";
import { IHousing } from "../interface/Housing.interface";

class Parser {
    provider: string;

    constructor(source: string) {
        this.provider = source;
    }

    parse(unprocessed: string) {
        if (this.provider === Provider.rentCanada) {
            return this.parseRentCanada(unprocessed);
        } else if (this.provider === Provider.rentFaster) {
            return this.parseRentFaster(unprocessed);
        } else if (this.provider === Provider.rentSeeker) {
            return this.parseRentSeeker(unprocessed);
        } else {
            throw new Error("Provider not selected");
        }
    }

    parseRentCanada(unprocessed: any): IHousing[] {
        // list of objects
        const mainList = unprocessed.listings;
        // properties of interest: address (for geolocating), city, province, url, description, externalUrl
        const apList: IHousing[] = [];
        for (let i = 0; i < mainList.length; i++) {
            const unit = mainList[i];
            const ap: IHousing = {
                type: "apartment",
                agreement: "rent",
                address: unit.address,
                state: unit.state,
                price: undefined,
            };
            apList.push(ap);
        }
        // TODO: convert address => lat/long for these
        return apList;
    }

    parseRentFaster(unprocessed: any): IHousing[] {
        // list of objects
        const mainList = unprocessed.listings;
        // properties of interest: address (for geolocating), city, link (is url), phone, latitude, longitude
        const apList: IHousing[] = [];
        for (let i = 0; i < mainList.length; i++) {
            const unit = mainList[i];
            const ap: IHousing = {
                type: "apartment",
                agreement: "rent",
                address: unit.address,
                state: undefined,
                price: unit.price,
                lat: unit.latitude,
                long: unit.longitude,
            };
            apList.push(ap);
        }
        return apList;
    }

    parseRentSeeker(unprocessed: any): IHousing[] {
        // list of objects
        const mainList = unprocessed.hits;
        // properties of interest: "name" here is the address (for geolocating), city, link (is url), phone, latitude, longitude
        const apList: IHousing[] = [];
        for (let i = 0; i < mainList.length; i++) {
            const unit = mainList[i];
            const ap: IHousing = {
                type: "apartment",
                agreement: "rent",
                address: unit.name,
                state: undefined,
                price: undefined,
                url: unit.url,
                lat: unit._geoloc.lat,
                long: unit._geoloc.lng,
            };
            apList.push(ap);
        }
        return apList;
    }
}

export default Parser;
