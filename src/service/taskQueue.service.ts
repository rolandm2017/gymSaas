import express from "express";

import {
    createTask,
    deleteTasksOlderThanTwoMonths,
    getAllTasksForProvider,
    getMostRecentTaskForProvider,
    getNextUnfinishedTaskForProvider,
    getTaskById,
    updateTask,
} from "../database/dao/task.dao";
import { getProviderByName } from "../database/dao/provider.dao";
import { ProviderEnum } from "../enum/provider.enum";
import { ILatLong } from "../interface/LatLong.interface";
import { Task } from "../database/models/Task";
import { ITask } from "../interface/Task.interface";

class TaskQueueService {
    constructor() {}

    public async queueGridScan(provider: ProviderEnum, coords: ILatLong[], zoomWidth: number): Promise<{ pass: number; fail: number }> {
        // step 3: fwd the grid coords to the scraper along with the bounds.
        // the scraper will scan every subdivision of the grid and report back its results.
        const successes: Task[] = [];
        //todo: associate task with provider by foreign key

        const mostRecentTask: Task[] = await getMostRecentTaskForProvider(provider);
        const mostRecentBatchNum: number = mostRecentTask[0].batch;

        for (let i = 0; i < coords.length; i++) {
            // FIXME: probably 'id' is missing somehow in the db *unless* autoassignment worked
            try {
                const s = await createTask({ providerName: provider, ...coords[i], zoomWidth, lastScan: undefined, batch: mostRecentBatchNum + 1 });
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

    public async getNextTaskForScraper(provider: ProviderEnum, batchNum?: number): Promise<ITask> {
        return await getNextUnfinishedTaskForProvider(provider, batchNum);
    }

    public async markTaskComplete(taskId: number): Promise<boolean> {
        const s = await getTaskById(taskId);
        if (s === null) {
            return false;
        }
        s.lastScan = new Date();
        await updateTask(s, taskId);
        return true;
    }

    public async cleanOldTasks(): Promise<number> {
        return await deleteTasksOlderThanTwoMonths();
    }

    public async examineDbContents(provider: ProviderEnum): Promise<ITask[]> {
        // used for testing and admin
        return await getAllTasksForProvider(provider);
    }
}

export default TaskQueueService;
