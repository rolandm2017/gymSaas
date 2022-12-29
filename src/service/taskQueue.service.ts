import express from "express";

import TaskDAO from "../database/dao/task.dao";
import { ProviderEnum } from "../enum/provider.enum";
import { ILatLong } from "../interface/LatLong.interface";
import { Task } from "../database/models/Task";
import { ITask } from "../interface/Task.interface";
import CityDAO from "../database/dao/city.dao";
import Parser from "../util/parser";
import { HousingCreationAttributes } from "../database/models/Housing";
import HousingDAO from "../database/dao/housing.dao";
import { IHousing } from "../interface/Housing.interface";
import { convertIHousingToCreationAttr } from "../util/housingConverter";
import BatchDAO from "../database/dao/batch.dao";
import CacheService from "./cache.service";

class TaskQueueService {
    private taskDAO: TaskDAO;
    private housingDAO: HousingDAO;
    private cacheService: CacheService;

    constructor(housingDAO: HousingDAO, taskDAO: TaskDAO, cacheService: CacheService) {
        this.housingDAO = housingDAO;
        this.taskDAO = taskDAO;
        this.cacheService = cacheService;
    }

    public async queueGridScan(
        provider: ProviderEnum,
        coords: ILatLong[],
        zoomWidth: number,
        cityName: string,
        batchNum: number,
    ): Promise<{ pass: number; fail: number; batchNum: number }> {
        const cachedNums = await this.cacheService.addBatchNumIfNotExists(batchNum);

        // step 3: fwd the grid coords to the scraper along with the bounds.
        // the scraper will scan every subdivision of the grid and report back its results.
        const correspondingCityId = await this.cacheService.getCityId(cityName);

        const successes: {}[] = [];

        try {
            for (let i = 0; i < coords.length; i++) {
                await this.taskDAO.createTask({
                    providerName: provider,
                    lat: coords[i].lat,
                    long: coords[i].long,
                    zoomWidth,
                    lastScan: null,
                    batchId: batchNum,
                    cityId: correspondingCityId,
                });
                successes.push({});
            }
        } catch (err) {
            console.log(err);
            throw err;
        }

        const results = {
            pass: successes.length,
            fail: coords.length - successes.length,
            batchNum,
        };
        return results;
    }

    // SINGLE
    public async getNextTaskForScraper(provider: ProviderEnum, batchNum?: number): Promise<ITask> {
        return await this.taskDAO.getNextUnfinishedTaskForProvider(provider, batchNum);
    }

    // PLURAL, note the plural!!
    public async getNextTasksForScraper(provider: ProviderEnum, batchNum?: number): Promise<Task[]> {
        const tasks = await this.taskDAO.getAllUnfinishedTasksForProvider(provider, batchNum);
        return tasks;
    }

    public async getTasksByBatchNum(batchNum: number): Promise<Task[]> {
        const tasks: Task[] = await this.taskDAO.getTasksByBatchNum(batchNum);
        return tasks;
    }

    public async reportFindingsToDb(
        provider: ProviderEnum,
        taskId: number,
        apartments: any,
        reportedCityId?: number, // optional param enables tests to bypass getting the cityId from the Task, which might not exist in testing
        batchNum?: number, // same story as above: optional so we can bypass a step during tests.
    ): Promise<{ pass: number; fail: number }> {
        const parser = new Parser(provider);
        const parsedApartmentData: IHousing[] = parser.parse(apartments);
        let successes = 0;
        // get city id for this task because its needed in the housing model for foreign key
        const currentTask = await this.taskDAO.getTaskById(taskId);
        if (currentTask === null) throw new Error("Orphaned task discovered");
        const cityId = reportedCityId ? reportedCityId : currentTask.cityId;
        const batchId = batchNum ? batchNum : currentTask.batchId;
        // update task's lastScan date
        await this.taskDAO.updateLastScanDate(currentTask, new Date());
        // add apartments
        try {
            for (const apartment of parsedApartmentData) {
                const apartmentCreationPayload = convertIHousingToCreationAttr(apartment, provider, taskId, cityId, batchId);
                await this.housingDAO.createHousing(apartmentCreationPayload);
                successes++;
            }
        } catch (err) {
            console.log(err);
            throw err;
        }
        const results = {
            pass: successes,
            fail: parsedApartmentData.length - successes,
        };
        return results;
    }

    public async markTaskComplete(taskId: number): Promise<boolean> {
        const task = await this.taskDAO.getTaskById(taskId);
        if (task === null) {
            return false;
        }
        task.lastScan = new Date();
        await this.taskDAO.updateTask(task, taskId);
        return true;
    }

    public async getAllTasks(choice: ProviderEnum | undefined, batchId: number | undefined, cityId: number | undefined): Promise<Task[]> {
        const all = await this.taskDAO.getAllTasks(choice, batchId, cityId);
        return all;
    }

    public async getScorecard(
        forProvider: ProviderEnum,
        batchNum: number,
    ): Promise<{ complete: Task[]; incomplete: Task[]; completeTotal: number; incompleteTotal: number }> {
        const allTasks = await this.taskDAO.getScorecard(forProvider, batchNum);
        const complete = allTasks.filter(t => t.lastScan !== null);
        const incomplete = allTasks.filter(t => t.lastScan === null);
        console.log(allTasks, allTasks.length, "142rm");
        return { complete, incomplete, completeTotal: complete.length, incompleteTotal: incomplete.length };
    }

    public async getAllBatchNumbers(): Promise<number[]> {
        const batches = await this.cacheService.getAllBatchNums();
        return batches;
    }

    public async cleanSpecific(bySpecificTaskIds: number[] | undefined, byRange: number[] | undefined): Promise<number[]> {
        const deletedTaskIds = [];
        let toDelete: number[] = [];
        // this is mostly to prevent ts from yelling about "maybe undefined!"
        const probablyUsingByRange = Array.isArray(bySpecificTaskIds) && bySpecificTaskIds.length === 0;
        const definitelyUsingByRange = Array.isArray(byRange); // this is mostly to satisfy TS
        if (probablyUsingByRange && definitelyUsingByRange) {
            for (let i = byRange[0]; i < byRange[1]; i++) {
                toDelete.push(i);
            }
        } else if (Array.isArray(bySpecificTaskIds)) {
            toDelete = bySpecificTaskIds;
        } else {
            throw new Error("input validation failed");
        }
        // loop over them and delete
        for (const taskId of toDelete) {
            try {
                await this.taskDAO.deleteTask(taskId);
                deletedTaskIds.push(taskId);
            } catch (err) {
                console.log(err);
                console.log(taskId + " failed to delete; perhaps it doesn't exist?");
            }
        }
        return deletedTaskIds;
    }

    public async cleanAll() {
        const numberOfDeletedRows = await this.taskDAO.deleteAll();
        return numberOfDeletedRows;
    }

    public async cleanOldTasks(): Promise<number> {
        return await this.taskDAO.deleteTasksOlderThanTwoMonths();
    }
}

export default TaskQueueService;
