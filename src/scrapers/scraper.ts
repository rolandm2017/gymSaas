import axios, { AxiosResponse } from "axios";
import { createTask } from "../database/dao/task.dao";
import { TaskCreationAttributes } from "../database/models/Task";
import { ProviderEnum } from "../enum/provider.enum";
import { IHousing } from "../interface/Housing.interface";
import { ILatLong } from "../interface/LatLong.interface";
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

    async scrape(lat: number, long: number, provider: ProviderEnum): Promise<IHousing[]> {
        const url: string = this.ip + ":" + this.port + "/";
        const json: string = JSON.stringify({ lat, long, provider });
        console.log(url, json, "24rm");
        // fixme2: url goes to nowhere in the scraper service
        const results: AxiosResponse<any, any> = await axios.post(url, json, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        // note for reviewers: I argue that organizing (parsing) the data is part of the action, "to scrape"
        const parser = new Parser(provider);
        console.log(parser, results.data.listings, "32rm");
        const housingData: IHousing[] = parser.parse(results.data);
        console.log(housingData.length, "33rm");
        return housingData;
    }
}

export default Scraper;
