import { ILatLong } from "../interface/LatLong.interface";

// The service converts e.g. "vancouver, BC, Canada" into lat and long. Or an address into a long/lat.
class LocationDiscoveryService {
    constructor() {}

    public async latLongDiscovery(city: string, state: string, country: string) {
        // TODO: go to Google, type in "citty string country lat long" and return the result.
    }

    public async geocoding(addr: string, city: string, state: string, country: string): ILatLong {
        // use google geocoding api to get the coords of an address
    }
}
