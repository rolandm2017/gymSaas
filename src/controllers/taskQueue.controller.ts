import express, { Request, Response } from "express";

import { Task } from "../database/models/Task";
import { IHousing } from "../interface/Housing.interface";
import { ProviderEnum } from "../enum/provider.enum";
import CacheService from "../service/cache.service";
import TaskQueueService from "../service/taskQueue.service";
import { ILatLong } from "../interface/LatLong.interface";
import { IBounds } from "../interface/Bounds.interface";
import ScraperService from "../service/scraper.service";
import { handleErrorResponse } from "../util/handleErrorResponse";
import { CityNameEnum } from "../enum/cityName.enum";
import { HealthCheck } from "../enum/healthCheck.enum";
import { isInteger, isLegitCityName, isProvider, isStringInteger } from "../validationSchemas/inputValidation";
import authorize from "../middleware/authorize.middleware";
import { Role } from "../enum/role.enum";

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
        this.router.post("/plan-grid-scan", authorize([Role.Admin]), this.getGridForScan.bind(this));
        // step 3 of 3 in queuing a scrape
        this.router.post("/queue-grid-scan", authorize([Role.Admin]), this.addGridScanToQueue.bind(this)); // admin only
        // stuff (separate from the 3 step queuing)
        this.router.get("/scrape", this.scrapeApartments.bind(this));
        this.router.get("/next-batch-number", this.getNextBatchNumber.bind(this));
        this.router.get("/next-tasks-for-scraper", this.getNextTasksForScraper.bind(this));
        // step 3.5
        this.router.post("/report-findings-and-mark-complete", this.reportFindingsToDbAndMarkComplete.bind(this));

        // used to check tasks make sense
        this.router.get("/all", this.getAllTasks.bind(this));
        this.router.get("/scorecard", this.getScorecard.bind(this));
        this.router.delete("/cleanup", authorize([Role.Admin]), this.cleanOldTasks.bind(this));
        this.router.delete("/by-id", authorize([Role.Admin]), this.cleanSpecific.bind(this));
        this.router.delete("/all", authorize([Role.Admin]), this.cleanAll.bind(this));
        this.router.get(HealthCheck.healthCheck, this.healthCheck.bind(this));
    }

    async scrapeApartments(request: Request, response: Response) {
        try {
            const city = request.body.city;
            const stateOrProvince = request.body.state;
            const country = request.body.country;
            const providerInput = request.body.provider;
            const provider = isProvider(providerInput);
            const aps: IHousing[] = await this.scraperService.scrapeApartments(provider, city, stateOrProvince, country);
            return response.json({ aps });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async getNextBatchNumber(request: Request, response: Response) {
        try {
            const highest = await this.cacheService.getBatchNumForNewBatches();
            if (highest >= 0) {
                return response.status(200).json({ nextBatchNum: highest });
            }
            // this only happens once
            this.cacheService.setBatchNumForNewBatches(0);
            return response.status(200).json({ nextBatchNum: 0 });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async getGridForScan(request: Request, response: Response) {
        try {
            const startCoords: ILatLong = request.body.startCoords;
            const bounds: IBounds = request.body.bounds;
            const radius: number = request.body.radius;
            // Not doing input validation here. It will fail fine + validation would be a gong show.
            const gridCoords = await this.scraperService.planGrid(startCoords, bounds, radius);
            return response.status(200).json({ gridCoords });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async addGridScanToQueue(request: Request, response: Response) {
        try {
            const providerInput = request.body.provider;
            const coords = request.body.coords;
            const zoomWidthInput = request.body.zoomWidth;
            const cityNameInput = request.body.cityName;
            const batchNumInput = request.body.batchNum; // admin should have gotten this from the previous endpoint
            console.log(request.body, "100rm");
            const provider = isProvider(providerInput);
            if (!Array.isArray(coords) || coords.length === 0) {
                // not doing more validation.
                return handleErrorResponse(response, "Invalid coords input");
            }
            const zoomWidth = isInteger(zoomWidthInput);
            const batchNum = isInteger(batchNumInput);
            const legitCityName = isLegitCityName(cityNameInput);
            if (!legitCityName) return handleErrorResponse(response, "cityName was not legit");

            const queued = await this.taskQueueService.queueGridScan(provider, coords, zoomWidth, legitCityName, batchNum);
            return response.status(200).json({ queued: queued });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async getNextTasksForScraper(request: Request, response: Response) {
        try {
            const providerInput = request.body.provider;
            // Currently batchNum is an OPTIONAL parameter!
            // If specified: Get that batch's unfinished tasks for provider.
            // If not specified: Get ALL unfinished tasks for provider.
            const batchNum = request.body.batchNum; // MIGHT need batch number, but also might not!
            const provider = isProvider(providerInput);
            const tasks: Task[] = await this.taskQueueService.getNextTasksForScraper(provider, batchNum);
            return response.status(200).json({ tasks });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async reportFindingsToDbAndMarkComplete(request: Request, response: Response) {
        try {
            // this is coming from the scraper so, no validation here!
            const forProvider: ProviderEnum = request.body.provider;
            const taskId: number = request.body.taskId;
            const apartments: any[] = request.body.apartments;
            const cityId = request.body.cityId;
            const batchNum = request.body.batchNum;
            if (typeof taskId !== "number" || taskId < 0) {
                return handleErrorResponse(response, "Bad task ID input");
            }
            console.log(apartments, "144rm");
            const successfullyLogged = await this.taskQueueService.reportFindingsToDb(forProvider, taskId, apartments, cityId, batchNum);
            const markedComplete = await this.taskQueueService.markTaskComplete(taskId);
            return response.status(200).json({ successfullyLogged, markedComplete, taskId });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async getAllTasks(request: Request, response: Response) {
        try {
            const byProviderInput = request.body.provider; // provider only should work.
            const byBatchNumInput = request.body.batchNum; // batchNum only should work.
            // submitting neither should work; "get all, I really mean ALL"
            const byProvider = byProviderInput ? isProvider(byProviderInput) : undefined;
            const byBatchNum = byBatchNumInput ? isStringInteger(byBatchNumInput) : undefined;
            const tasks: Task[] = await this.taskQueueService.getAllTasks(byProvider, byBatchNum, undefined);
            const { complete, incomplete } = this.taskQueueService.countComplete(tasks);
            console.log(tasks.length, "160rm");
            return response.status(200).json({ tasks, count: tasks.length, complete, incomplete });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getScorecard(request: Request, response: Response) {
        try {
            const byProviderInput = request.body.provider; // provider only should work.
            const byBatchNumInput = request.body.batchNum; // batchNum only should work.
            const byProvider = isProvider(byProviderInput);
            const byBatchNum = isInteger(byBatchNumInput);
            const scorecard = await this.taskQueueService.getScorecard(byProvider, byBatchNum);
            return response.status(200).json({ ...scorecard });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async cleanSpecific(request: Request, response: Response) {
        try {
            const bySpecificTaskIds = request.body.toDelete;
            const byRange = [request.body.start, request.body.end];
            // validation
            const usingByArray = Array.isArray(bySpecificTaskIds) && bySpecificTaskIds.every((i: any) => typeof i === "number" && i >= 0);
            const usingByRange = typeof request.body.start === "number" && typeof request.body.end === "number" && byRange[0] < byRange[1];
            if (!usingByArray && !usingByRange) return handleErrorResponse(response, "bad inputs");
            // service
            const deletedTaskIds: number[] = await this.taskQueueService.cleanSpecific(bySpecificTaskIds, byRange);
            return response.status(200).json({ deletedTaskIds });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
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
