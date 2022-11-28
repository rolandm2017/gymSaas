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
import { IBatch } from "../interface/Batch.interface";
import CacheService from "./cache.service";

class TaskQueueService {
    private cityDAO: CityDAO;
    private batchDAO: BatchDAO;
    private taskDAO: TaskDAO;
    private housingDAO: HousingDAO;
    private cacheService: CacheService;

    constructor(cityDAO: CityDAO, housingDAO: HousingDAO, batchDAO: BatchDAO, taskDAO: TaskDAO, cacheService: CacheService) {
        this.cityDAO = cityDAO;
        this.housingDAO = housingDAO;
        this.batchDAO = batchDAO;
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
        this.cacheService.addBatchNumIfNotExists(batchNum);
        // step 3: fwd the grid coords to the scraper along with the bounds.
        // the scraper will scan every subdivision of the grid and report back its results.
        const cityForId = await this.cityDAO.getCityByName(cityName);
        if (cityForId === null) throw new Error("City not found");

        const successes: {}[] = [];

        for (let i = 0; i < coords.length; i++) {
            try {
                await this.taskDAO.createTask({
                    providerName: provider,
                    lat: coords[i].lat,
                    long: coords[i].long,
                    zoomWidth,
                    lastScan: null,
                    batch: batchNum,
                    cityId: cityForId.cityId,
                });
                successes.push({});
            } catch (err) {
                console.log(err);
            }
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

    public async reportFindingsToDb(provider: ProviderEnum, taskId: number, apartments: any): Promise<{ pass: number; fail: number }> {
        const parser = new Parser(provider);
        const parsedApartmentData: IHousing[] = parser.parse(apartments);
        const successes: {}[] = [];
        // get city id for this task because its needed in the housing model for foreign key
        const currentTask = await this.taskDAO.getTaskById(taskId);
        if (currentTask === null) throw new Error("Orphaned task discovered");
        const cityId = currentTask.cityId;
        // update task's lastScan date
        await this.taskDAO.updateLastScanDate(currentTask, new Date());
        // add apartments
        for (const apartment of parsedApartmentData) {
            try {
                const apartmentCreationPayload: HousingCreationAttributes = convertIHousingToCreationAttr(apartment, provider, taskId, cityId);
                this.housingDAO.createHousing(apartmentCreationPayload);
                successes.push({});
            } catch (err) {
                console.log(err);
            }
        }
        const results = {
            pass: successes.length,
            fail: parsedApartmentData.length - successes.length,
        };
        return results;
    }

    public async markTaskComplete(taskId: number): Promise<boolean> {
        const s = await this.taskDAO.getTaskById(taskId);
        if (s === null) {
            return false;
        }
        s.lastScan = new Date();
        await this.taskDAO.updateTask(s, taskId);
        return true;
    }

    public async getAllTasks(choice: ProviderEnum | undefined, batchId: number | undefined, cityId: number | undefined): Promise<Task[]> {
        const all = await this.taskDAO.getAllTasks(choice, batchId, cityId);
        return all;
    }

    public async getAllBatchNumbers(): Promise<IBatch[]> {
        const batches = await this.batchDAO.getAllBatchNums();
        return batches;
    }

    public async cleanSpecific(byArray: number[] | undefined, byRange: number[] | undefined): Promise<number[]> {
        const deletedTaskIds = [];
        let toDelete: number[] = [];
        // this is mostly to prevent ts from yelling about "maybe undefined!"
        const probablyUsingByRange = Array.isArray(byArray) && byArray.length === 0;
        const definitelyUsingByRange = Array.isArray(byRange); // this is mostly to satisfy TS
        if (probablyUsingByRange && definitelyUsingByRange) {
            for (let i = byRange[0]; i < byRange[1]; i++) {
                toDelete.push(i);
            }
        } else if (Array.isArray(byArray)) {
            toDelete = byArray;
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

    public async cleanOldTasks(): Promise<number> {
        return await this.taskDAO.deleteTasksOlderThanTwoMonths();
    }
}

export default TaskQueueService;
