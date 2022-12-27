import axios, { AxiosResponse } from "axios";
import TaskDAO from "../database/dao/task.dao";
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
    private taskDAO: TaskDAO;

    constructor(site: string, ip: string, port: number, taskDAO: TaskDAO) {
        this.site = site;
        this.ip = ip;
        this.port = port;
        this.taskDAO = taskDAO;
    }

    async scrape(lat: number, long: number, provider: ProviderEnum): Promise<IHousing[]> {
        const url: string = this.ip + ":" + this.port + "/";
        const json: string = JSON.stringify({ id: 0, lat, long, provider });
        const results: AxiosResponse<any, any> = await axios.post(url, json, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        // note for reviewers: I argue that organizing (parsing) the data is part of the action, "to scrape"
        const parser = new Parser(provider);
        const housingData: IHousing[] = parser.parse(results.data);
        return housingData;
    }

    // async queueGridScrape(tasks: ILatLong[], zoomWidth: number, batchNum: number): Promise<boolean> {
    //     try {
    //         // todo: go into shared db and queue tasks.
    //         for (const task of tasks) {
    //             const newTask: TaskCreationAttributes = {
    //                 ...task,
    //                 zoomWidth: zoomWidth,
    //                 lastScan: null,
    //                 batchId: batchNum,
    //                 providerName: ProviderEnum.rentCanada, // TODO: distribute tasks to all 3 providers when ready
    //             };
    //             await this.taskDAO.createTask(newTask);
    //         }
    //         return true;
    //     } catch (err) {
    //         console.log(err);
    //         return false;
    //     }
    // }
}

export default Scraper;
