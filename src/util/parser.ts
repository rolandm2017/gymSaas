import { ProviderEnum } from "../enum/provider.enum";
import { IHousing } from "../interface/Housing.interface";

class Parser {
    provider: ProviderEnum;

    constructor(source: ProviderEnum) {
        this.provider = source;
    }

    parse(unprocessed: any) {
        if (this.provider === ProviderEnum.rentCanada) {
            return this.parseRentCanada(unprocessed);
        } else if (this.provider === ProviderEnum.rentFaster) {
            return this.parseRentFaster(unprocessed);
        } else if (this.provider === ProviderEnum.rentSeeker) {
            return this.parseRentSeeker(unprocessed);
        } else {
            throw new Error("Provider not selected");
        }
    }

    parseRentCanada(unprocessed: any): IHousing[] {
        // list of objects
        console.log("25rm");
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
                source: this.provider,
                // TODO: if coords MIA, query geoCoding API with address IF not present in noSQL db. also store in DB for next time.
                lat: unit.latitude,
                long: unit.longitude,
            };
            apList.push(ap);
        }
        // TODO: convert address => lat/long for these
        console.log(apList.length, "44rm");
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
                source: this.provider,
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
                source: this.provider,
            };
            apList.push(ap);
        }
        return apList;
    }
}

export default Parser;
