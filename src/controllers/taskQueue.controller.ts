import express, { Request, Response } from "express";

import { Task } from "../database/models/Task";
import { IHousing } from "../interface/Housing.interface";
import { ProviderEnum } from "../enum/provider.enum";
import CacheService from "../service/cache.service";
import TaskQueueService from "../service/taskQueue.service";
import { ILatLong } from "../interface/LatLong.interface";
import { IBounds } from "../interface/Bounds.interface";
import ScraperService from "../service/scraper.service";
import { errorResponse } from "../util/responses/handleErrorResponse";
import { CityNameEnum } from "../enum/cityName.enum";
import { HealthCheck } from "../enum/healthCheck.enum";

// do I need a "scraper controller" and a separate "task queue controller"?
class TaskQueueController {
    public path = "/task-queue";
    public router = express.Router();
    private taskQueueService: TaskQueueService;
    private scraperService: ScraperService;
    private cacheService: CacheService;

    // todo in production: mark several routes "admin only" like this: authorize([Role.Admin])

    constructor(taskQueueService: TaskQueueService, scraperService: ScraperService, cacheService: CacheService) {
        this.taskQueueService = taskQueueService;
        this.scraperService = scraperService;
        this.cacheService = cacheService;
        // step 2 of 3 in queuing a scrape
        this.router.post("/plan-grid-scan", this.getGridForScan.bind(this));
        // step 3 of 3 in queuing a scrape
        this.router.post("/queue-grid-scan", this.addGridScanToQueue.bind(this)); // admin only
        // stuff (separate from the 3 step queuing)
        this.router.get("/scrape", this.scrapeApartments.bind(this));
        this.router.get("/next-batch-number", this.getNextBatchNumber.bind(this));
        this.router.get("/next-tasks-for-scraper", this.getNextTasksForScraper.bind(this));
        // step 3.5
        this.router.post("/report-findings-and-mark-complete", this.reportFindingsToDbAndMarkComplete.bind(this));

        // used to check tasks make sense
        this.router.get("/all", this.getAllTasks.bind(this));
        // this.router.get("/batch", this.getTasksByBatch.bind(this));
        this.router.delete("/cleanup", this.cleanOldTasks.bind(this));
        this.router.delete("/by-id", this.cleanSpecific.bind(this));
        this.router.delete("/all", this.cleanAll.bind(this));
        // this.router.get("/db-contents", )
        this.router.get(HealthCheck.healthCheck, this.healthCheck.bind(this));
    }

    async scrapeApartments(request: Request, response: Response) {
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return errorResponse(response, "Parameter missing");
        }
        const aps: IHousing[] = await this.scraperService.scrapeApartments(ProviderEnum.rentCanada, city, stateOrProvince, country); // todo: advance from hardcode provider choice
        return response.json({ aps });
    }

    async getNextBatchNumber(request: Request, response: Response) {
        const highest = await this.cacheService.getBatchNumForNewBatches();
        if (typeof highest === "number" && highest >= 0) return response.status(200).json({ nextBatchNum: highest });
        // so this only happens once
        this.cacheService.setBatchNumForNewBatches(0);
        return response.status(200).json({ nextBatchNum: 0 });
    }

    async getGridForScan(request: Request, response: Response) {
        const startCoords: ILatLong = request.body.startCoords;
        const bounds: IBounds = request.body.bounds;
        const radius: number = request.body.radius;
        // not doing input validation here.
        const gridCoords = await this.scraperService.planGrid(startCoords, bounds, radius);
        return response.status(200).json({ gridCoords });
    }

    async addGridScanToQueue(request: Request, response: Response) {
        const provider = request.body.provider;
        const coords = request.body.coords;
        const zoomWidth = request.body.zoomWidth;
        const cityName = request.body.cityName;
        const batchNum = request.body.batchNum; // admin should have gotten this from the previous endpoint
        if (provider !== ProviderEnum.rentCanada && provider !== ProviderEnum.rentFaster && provider !== ProviderEnum.rentSeeker) {
            return errorResponse(response, "Invalid provider input");
        }
        if (!Array.isArray(coords) || coords.length === 0) {
            return errorResponse(response, "Invalid coords input");
        }
        if (typeof zoomWidth !== "number" || zoomWidth < 0) {
            return errorResponse(response, "Invalid zoomWidth input");
        }
        if (batchNum === undefined || batchNum === null) return errorResponse(response, "batchNum must be defined");
        // "if batchNum is supplied, check if its a number"
        if (batchNum && typeof batchNum !== "number") return errorResponse(response, "Invalid batchNum input");
        const legitCityName = Object.values(CityNameEnum).some(name => name == cityName);
        if (!legitCityName) return errorResponse(response, "cityName was not legit");

        const queued = await this.taskQueueService.queueGridScan(provider, coords, zoomWidth, cityName, batchNum);
        return response.status(200).json({ queued: queued });
    }

    async getNextTasksForScraper(request: Request, response: Response) {
        const provider = request.body.provider;
        // Currently batchNum is an OPTIONAL parameter!
        // If specified: Get that batch's unfinished tasks for provider.
        // If not specified: Get ALL unfinished tasks for provider.
        const batchNum = request.body.batchNum; // MIGHT need batch number, but also might not!
        if (provider !== ProviderEnum.rentCanada && provider !== ProviderEnum.rentFaster && provider !== ProviderEnum.rentSeeker) {
            return errorResponse(response, "Invalid provider input");
        }
        const tasks: Task[] = await this.taskQueueService.getNextTasksForScraper(provider, batchNum);

        return response.status(200).json({ tasks });
    }

    async reportFindingsToDbAndMarkComplete(request: Request, response: Response) {
        const forProvider: ProviderEnum = request.body.provider;
        const taskId: number = request.body.taskId;
        const apartments: any[] = request.body.apartments;
        const cityId = request.body.cityId;
        const batchNum = request.body.batchNum;
        if (typeof taskId !== "number" || taskId < 0) {
            return errorResponse(response, "Bad task ID input");
        }
        const successfullyLogged = await this.taskQueueService.reportFindingsToDb(forProvider, taskId, apartments, cityId, batchNum);
        const markedComplete = await this.taskQueueService.markTaskComplete(taskId);
        return response.status(200).json({ successfullyLogged, markedComplete, taskId });
    }

    async getAllTasks(request: Request, response: Response) {
        const byProvider = request.body.provider; // provider only should work.
        const byBatchNum = request.body.batchNum; // batchNum only should work.
        // todo: neither should work; "get all, I really mean ALL"
        if (byProvider && typeof byProvider !== "string") return errorResponse(response, "provider must be int");
        if (byBatchNum && typeof byBatchNum !== "number") return errorResponse(response, "batchNum must be int");
        const tasks: Task[] = await this.taskQueueService.getAllTasks(byProvider, byBatchNum, undefined);
        return response.status(200).json({ tasks });
    }

    async cleanSpecific(request: Request, response: Response) {
        const bySpecificTaskIds = request.body.toDelete;
        const byRange = [request.body.start, request.body.end];
        // validation
        const usingByArray = Array.isArray(bySpecificTaskIds) && bySpecificTaskIds.every((i: any) => typeof i === "number" && i >= 0);
        const usingByRange = typeof request.body.start === "number" && typeof request.body.end === "number" && byRange[0] < byRange[1];
        if (!usingByArray && !usingByRange) return errorResponse(response, "bad inputs");
        // service
        const deletedTaskIds: number[] = await this.taskQueueService.cleanSpecific(bySpecificTaskIds, byRange);
        return response.status(200).json({ deletedTaskIds });
    }

    async cleanAll(request: Request, response: Response) {
        const deletedRows = await this.taskQueueService.cleanAll();
        return response.status(200).json({ message: `Deleted ${deletedRows} rows in the task queue` });
    }

    async cleanOldTasks(request: Request, response: Response) {
        const deleted = await this.taskQueueService.cleanOldTasks();
        return response.status(200).json({ deleted });
    }

    async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ status: "Online" });
    }
}

export default TaskQueueController;
