import express from "express";

import { createTask } from "../database/dao/task.dao";
import { Provider } from "../enum/provider.enum";
import { ILatLong } from "../interface/LatLong.interface";

class TaskQueueService {
    constructor() {}

    public async queueGridScan(provider: Provider, coords: ILatLong[], zoomWidth: number): Promise<{ pass: number; fail: number }> {
        // step 3: fwd the grid coords to the scraper along with the bounds.
        // the scraper will scan every subdivision of the grid and report back its results.
        const successes = [];
        //todo: associate task with provider by foreign key
        // TODO: Acquire Provider from db via provider arg. Use Provider to "addProvider_tasks" I think?
        for (let i = 0; i < coords.length; i++) {
            // FIXME: probably 'id' is missing somehow in the db
            try {
                const s = await createTask({ ...coords[i], zoomWidth, lastScan: undefined });
                successes.push(s);
            } catch (err) {
                console.log(err);
            }
        }

        const results = {
            pass: successes.length,
            fail: coords.length - successes.length,
        };
        return results;
    }

    public async getNextTaskForScraper(provider: Provider): Promise<ITask> {
        //
        
    }

    public async getNextBatchForScraper(provider: Provider): Promise<ITask[]> {
        //
    }
}
