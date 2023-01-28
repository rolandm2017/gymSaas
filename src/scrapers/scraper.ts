import axios, { AxiosResponse } from "axios";
import { ProviderEnum } from "../enum/provider.enum";
import { IHousing } from "../interface/Housing.interface";
import Parser from "./parser";

// class will handle info about various scraper types. "is it a long/lat or city input? does it return aps with streets, coords, both?"
class Scraper {
    site: string;
    ip: string;
    port: number;

    constructor(site: string, ip: string, port: number) {
        this.site = site;
        this.ip = ip;
        this.port = port;
    }

    async scrape(lat: number, long: number, provider: ProviderEnum, zoomWidth: number): Promise<IHousing[]> {
        const url: string = this.ip + ":" + this.port + "/";
        const json: string = JSON.stringify({ id: 0, lat, long, provider, zoomWidth });
        const results: AxiosResponse<any, any> = await axios.post(url, json, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        // note for reviewers: I argue that organizing (parsing) the data is part of the action, "to scrape"
        console.log(`parsing for ${provider}`);
        const parser = new Parser(provider);
        // const housingData: IHousing[] = parser.parse(results.data);
        const housingData: IHousing[] = parser.parse(results.data);
        return housingData;
    }

    public async fetchUrlForId(idAtRentCanada: number): Promise<string> {
        const endpointUrl: string = this.ip + ":" + this.port + "/fetch-url?id=" + idAtRentCanada.toString();
        const result = await axios.get(endpointUrl);
        const url = result.data;
        return url;
    }
}

export default Scraper;
