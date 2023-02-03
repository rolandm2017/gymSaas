"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const provider_enum_1 = require("../enum/provider.enum");
class Parser {
    constructor(source) {
        this.provider = source;
    }
    parse(unprocessed) {
        if (this.provider === provider_enum_1.ProviderEnum.rentCanada) {
            return this.parseRentCanada(unprocessed);
        }
        else if (this.provider === provider_enum_1.ProviderEnum.rentFaster) {
            return this.parseRentFaster(unprocessed);
        }
        else if (this.provider === provider_enum_1.ProviderEnum.rentSeeker) {
            return this.parseRentSeeker(unprocessed);
        }
        else {
            throw new Error("Provider not selected");
        }
    }
    parseRentCanada(unprocessed) {
        // list of objects
        const mainList = unprocessed.listings; // do not change this
        if (mainList.length === 0) {
            // handle case where no aps found
            return [];
        }
        // const mainList = unprocessed.results.listings; // do not change this
        const apList = [];
        for (let i = 0; i < mainList.length; i++) {
            const unit = mainList[i];
            const ap = {
                buildingType: "apartment",
                agreementType: "rent",
                address: unit.address,
                state: unit.state,
                price: undefined,
                source: this.provider,
                url: "",
                // url: // fill in as a cached value for rentCanada; rentFaster and rentSeeker don't need this caching
                lat: unit.latitude,
                long: unit.longitude,
                idAtSource: unit.id,
                distanceToNearestGym: 0,
            };
            apList.push(ap);
        }
        return apList;
    }
    parseRentFaster(unprocessed) {
        // list of objects
        const mainList = unprocessed.listings; // do not change this
        if (mainList.length === 0) {
            // handle case where no aps found
            return [];
        }
        // const mainList = unprocessed.results.listings; // do not change this
        // properties of interest: address (for geolocating), city, link (is url), phone, latitude, longitude
        const apList = [];
        for (let i = 0; i < mainList.length; i++) {
            const unit = mainList[i];
            const ap = {
                buildingType: "apartment",
                agreementType: "rent",
                address: unit.address,
                state: undefined,
                price: unit.price,
                url: unit.link,
                lat: unit.latitude,
                long: unit.longitude,
                source: this.provider,
                distanceToNearestGym: 0,
            };
            apList.push(ap);
        }
        return apList;
    }
    parseRentSeeker(unprocessed) {
        // list of objects
        const mainList = unprocessed.hits; // do not change this
        if (mainList.length === 0) {
            // handle case where no aps found
            return [];
        }
        // const mainList = unprocessed.results.hits; // do not change this
        // properties of interest: "name" here is the address (for geolocating), city, link (is url), phone, latitude, longitude
        const apList = [];
        for (let i = 0; i < mainList.length; i++) {
            const unit = mainList[i];
            const ap = {
                buildingType: "apartment",
                agreementType: "rent",
                address: unit.name,
                state: undefined,
                price: undefined,
                url: unit.url,
                lat: unit._geoloc.lat,
                long: unit._geoloc.lng,
                source: this.provider,
                distanceToNearestGym: 0,
            };
            apList.push(ap);
        }
        return apList;
    }
}
exports.default = Parser;
