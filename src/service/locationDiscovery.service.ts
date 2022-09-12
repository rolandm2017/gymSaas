import axios, { AxiosResponse } from "axios";
import { ILatLong } from "../interface/LatLong.interface";

const APIKEY = process.env.GOOGLE_GEOCODING_API_KEY;

// The service converts e.g. "vancouver, BC, Canada" into lat and long. Or an address into a long/lat.
class LocationDiscoveryService {
    constructor() {}

    public async latLongDiscovery(city: string, state: string, country: string) {
        // TODO: go to Google, type in "citty string country lat long" and return the result.
    }

    public async geocoding(addr: string, city: string, state: string, country: string): Promise<ILatLong> {
        // use google geocoding api to get the coords of an address
        console.log("in", APIKEY);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${APIKEY}&address=${city} ${state} ${country}`;

        const results: AxiosResponse<any, any> = await axios.get(url);
        // console.log(results, "20rm");
        let coords = results.data.results[0].geometry.location;
        // const coords = results.data.results.geometry.location;
        coords = { lat: coords.lat, long: coords.lng };
        // const coords = { lat: results.data.results.geometry.location.lat, long: results.data.results.geometry.location.long };
        console.log(coords, "19rm");
        return coords;
    }
}

export default LocationDiscoveryService;
