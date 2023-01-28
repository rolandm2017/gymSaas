import express from "express";

import TaskDAO from "../database/dao/task.dao";
import { ProviderEnum, ProviderEnumOrAll } from "../enum/provider.enum";
import { ILatLong } from "../interface/LatLong.interface";
import { Task } from "../database/models/Task";
import { ITask } from "../interface/Task.interface";
import CityDAO from "../database/dao/city.dao";
import Parser from "../scrapers/parser";
import { HousingCreationAttributes } from "../database/models/Housing";
import HousingDAO from "../database/dao/housing.dao";
import { IHousing } from "../interface/Housing.interface";
import { convertIHousingToCreationAttr } from "../util/housingConverter";
import BatchDAO from "../database/dao/batch.dao";
import CacheService from "./cache.service";
import { IHousingWithUrl } from "../interface/HousingWithUrl.interface";
import { COMPLETE_TASK_TIME_THRESHOLD_IN_DAYS, MIN_SCRAPES_FOR_REPEAT_SCRAPE } from "../util/constants";
import { CityNameEnum } from "../enum/cityName.enum";

class TaskQueueService {
    private taskDAO: TaskDAO;
    private housingDAO: HousingDAO;
    private cityDAO: CityDAO;
    private batchDAO: BatchDAO;
    private cacheService: CacheService;

    constructor(housingDAO: HousingDAO, taskDAO: TaskDAO, cityDAO: CityDAO, batchDAO: BatchDAO, cacheService: CacheService) {
        this.housingDAO = housingDAO;
        this.taskDAO = taskDAO;
        this.cityDAO = cityDAO;
        this.batchDAO = batchDAO;
        this.cacheService = cacheService;
    }

    public async queueGridScan(
        provider: ProviderEnum,
        coords: ILatLong[],
        zoomWidth: number,
        cityName: string,
        batchNum: number,
    ): Promise<{ pass: number; fail: number; batchNum: number }> {
        // todo: low priority - caching the batch num to cut read/write in half
        // const cachedNums = await this.cacheService.addBatchNumIfNotExists(batchNum);
        const all = await this.batchDAO.getAllBatchNums();
        const alreadyWritten = all.includes(batchNum);
        if (!alreadyWritten) {
            await this.batchDAO.addBatchNum(batchNum);
        }

        // step 3: fwd the grid coords to the scraper along with the bounds.
        // the scraper will scan every subdivision of the grid and report back its results.
        const correspondingCityId = await this.cacheService.getCityId(cityName);

        // "temp" bandaid

        let successes = 0;

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
                    ignore: false,
                });
                successes++;
            }
        } catch (err) {
            console.log(err);
            throw err;
        }

        const results = {
            pass: successes,
            fail: coords.length - successes,
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

    public async getTasksByWithSpecifications(batchNum: number, cityName: string, provider: ProviderEnumOrAll): Promise<Task[]> {
        // handle case where cityName is "all"
        const cityNameInputIsAll = cityName === "all";

        if (cityNameInputIsAll) {
            //
            const correspondingCities = await this.cityDAO.getAllCities();
            if (correspondingCities.length === 0) throw Error("Unexpected failure from no cities retrieved");
            if (provider === ProviderEnumOrAll.all) {
                // all providers, all cities
                const tasks: Task[] = await this.taskDAO.getTasksByBatchNum(batchNum);
                return tasks;
            }
            // by specific batch num and provider now
            const tasks: Task[] = await this.taskDAO.getTasksByBatchNumAndProvider(batchNum, provider);
            return tasks;
        }
        // **
        // handle case where cityName is not all and is a valid city name
        const allValidCities = Object.values(CityNameEnum) as string[];
        const cityNameIsASpecificCity = allValidCities.includes(cityName);

        if (cityNameIsASpecificCity) {
            //
            const correspondingCity = await this.cityDAO.getCityByName(cityName);
            if (correspondingCity === null) throw Error("Invalid city name");
            if (provider === ProviderEnumOrAll.all) {
                const tasks: Task[] = await this.taskDAO.getTasksByBatchNumAndCityId(batchNum, correspondingCity.cityId);
                return tasks;
            }
            // by specific provider, cityname, batch num
            const tasks: Task[] = await this.taskDAO.getTasksByBatchNumAndCityIdAndProvider(batchNum, correspondingCity.cityId, provider);

            return tasks;
        }
        // **
        // handle case where cityName is not all and is overall invalid
        const invalidCityName = true; // it must be false because otherwise the prev 2 conditions would've handled it.
        return [];
    }

    public async reportFindingsToDb(
        provider: ProviderEnum,
        taskId: number,
        apartments: any,
        reportedCityId?: number, // optional param enables tests to bypass getting the cityId from the Task, which might not exist in testing
        batchNum?: number, // same story as above: optional so we can bypass a step during tests.
    ): Promise<{ pass: number; fail: number }> {
        const parser = new Parser(provider);
        const parsedApartmentData: IHousingWithUrl[] = parser.parse(apartments);
        console.log(`adding ${parsedApartmentData.length} apartments`);
        let successes = 0;
        // get city id for this task because its needed in the housing model for foreign key
        const currentTask = await this.taskDAO.getTaskById(taskId);
        if (currentTask === null) {
            throw new Error("Orphaned task discovered");
        }
        const cityId = reportedCityId ? reportedCityId : currentTask.cityId;
        const batchId = batchNum ? batchNum : currentTask.batchId;
        // update task's lastScan date
        await this.taskDAO.updateLastScanDate(currentTask, new Date());
        // mark it ignored if there are too few results to repeat it
        const tooFewApartmentsToContinueScrape = parsedApartmentData.length < MIN_SCRAPES_FOR_REPEAT_SCRAPE;
        if (tooFewApartmentsToContinueScrape) {
            console.log(`Marking ignored for task with id ${taskId}`);
            await this.taskDAO.markIgnored(currentTask);
        }
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
        return { complete, incomplete, completeTotal: complete.length, incompleteTotal: incomplete.length };
    }

    public async getAllBatchNumbers(): Promise<number[]> {
        // FIXME: cache service (low priority)
        // const batches = await this.cacheService.getAllBatchNums();
        const batches = await this.batchDAO.getAllBatchNums();
        return batches;
    }

    public countComplete(tasks: Task[]): { complete: number; incomplete: number } {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - COMPLETE_TASK_TIME_THRESHOLD_IN_DAYS);
        const complete = tasks.filter((task: Task) => task.lastScan !== null && task.lastScan < thirtyDaysAgo);
        const incomplete = tasks.length - complete.length;
        return { complete: complete.length, incomplete };
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
