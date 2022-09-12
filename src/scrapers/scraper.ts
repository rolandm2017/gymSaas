import axios, { AxiosResponse } from "axios";
import { Provider } from "../enum/provider.enum";
import { IHousing } from "../interface/Housing.interface";
import Parser from "../util/parser";

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

    async scrape(lat: number, long: number, provider: Provider): Promise<IHousing[]> {
        // async scrape(city: string, state: string, country: "Canada" | "canada") {
        console.log("here");
        const url: string = this.ip + ":" + this.port;
        const json: string = JSON.stringify({ lat, long });
        console.log(url, json, "20rm");
        // try {
        const results: AxiosResponse<any, any> = await axios.post(url, json, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const parser = new Parser(provider);
        const housingData: IHousing[] = parser.parse(results.data);
        return housingData;
        // const aps = [];

        // console.log(housingData, "21rm");
        // const apartments: IHousing[] = [];
        // for (const a of housingData) {
        //     const ap = a as IHousing;
        //     apartments.push(ap);
        // }

        // console.log(apartments, "18rm");
        // return apartments;
        // } catch (err) {
        //     console.log("error");
        //     console.log(err);
        // }
    }
}

export default Scraper;
