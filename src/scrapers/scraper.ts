import axios, { AxiosResponse } from "axios";
import { IHousing } from "../interface/Housing.interface";

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

    async scrape(city: string, state: string, country: "Canada" | "canada") {
        const url: string = this.ip + ":" + this.port;
        const json: string = JSON.stringify({ city, state, country });
        const results: AxiosResponse<any, any> = await axios.post(url, json);

        console.log(results, "21rm");
        // const apartments:IHousing[] = [];
        // for (const a of results) {

        // }

        // console.log(apartments, "18rm");
        // return apartments;
    }
}

export default Scraper;
