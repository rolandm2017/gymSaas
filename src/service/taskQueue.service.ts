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

class TaskQueueService {
    private cityDAO: CityDAO;
    private taskDAO: TaskDAO;
    private housingDAO: HousingDAO;

    constructor(cityDAO: CityDAO, housingDAO: HousingDAO, taskDAO: TaskDAO) {
        this.cityDAO = cityDAO;
        this.housingDAO = housingDAO;
        this.taskDAO = taskDAO;
    }

    public async queueGridScan(
        provider: ProviderEnum,
        coords: ILatLong[],
        zoomWidth: number,
        cityName: string,
    ): Promise<{ pass: number; fail: number }> {
        // step 3: fwd the grid coords to the scraper along with the bounds.
        // the scraper will scan every subdivision of the grid and report back its results.
        const city = await this.cityDAO.getCityByName(cityName);
        if (city === null) throw new Error("City not found");

        const successes: {}[] = [];

        const mostRecentTask: Task[] = await this.taskDAO.getMostRecentTaskForProvider(provider);
        let mostRecentBatchNum: number | undefined;
        if (mostRecentTask.length === 0) {
            mostRecentBatchNum = 0;
        } else {
            mostRecentBatchNum = mostRecentTask[0].batch;
        }

        for (let i = 0; i < coords.length; i++) {
            try {
                const s = await this.taskDAO.createTask({
                    providerName: provider,
                    lat: coords[i].lat,
                    long: coords[i].long,
                    zoomWidth,
                    lastScan: undefined,
                    batch: mostRecentBatchNum + 1,
                    cityId: city.cityId,
                });
                successes.push({});
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
        return await this.taskDAO.getNextUnfinishedTaskForProvider(provider, batchNum);
    }

    public async getNextTasksForScraper(provider: ProviderEnum, batchNum?: number): Promise<Task[]> {
        const tasks = await this.taskDAO.getAllTasksForProvider(provider);
        return tasks;
    }

    public async reportFindingsToDb(provider: ProviderEnum, taskId: number, apartments: any): Promise<{ pass: number; fail: number }> {
        const parser = new Parser(provider);
        const parsedApartmentData: IHousing[] = parser.parse(apartments);
        const successes: {}[] = [];
        for (const apartment of parsedApartmentData) {
            try {
                const apartmentCreationPayload: HousingCreationAttributes = convertIHousingToCreationAttr(apartment, provider);
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
        // todo: log success of the reporting
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

    public async getAllTasks(choice?: ProviderEnum): Promise<Task[]> {
        const all = await this.taskDAO.getAllTasks(choice);
        return all;
    }

    public async cleanOldTasks(): Promise<number> {
        return await this.taskDAO.deleteTasksOlderThanTwoMonths();
    }

    public async examineDbContents(provider: ProviderEnum): Promise<ITask[]> {
        // used for testing and admin
        return await this.taskDAO.getAllTasksForProvider(provider);
    }
}

export default TaskQueueService;
