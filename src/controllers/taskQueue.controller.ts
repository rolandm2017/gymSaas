import express, { Request, Response } from "express";
import { cache } from "joi";

import { getBatchNumForNewBatches } from "../database/cache/batchNumCache";
import BatchDAO from "../database/dao/batch.dao";
import { Task } from "../database/models/Task";
import { IHousing } from "../interface/Housing.interface";
import { ProviderEnum } from "../enum/provider.enum";
import { ITask } from "../interface/Task.interface";
import CacheService from "../service/cache.service";
import TaskQueueService from "../service/taskQueue.service";
import { ILatLong } from "../interface/LatLong.interface";
import { IBounds } from "../interface/Bounds.interface";
import ScraperService from "../service/scraper.service";

// do I need a "scraper controller" and a separate "task queue controller"?
class TaskQueueController {
    public path = "/task_queue";
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
        this.router.get("/grid_scan_plan", this.getGridForScan.bind(this));
        // step 3 of 3 in queuing a scrape
        this.router.post("/queue_grid_scan", this.addGridScanToQueue.bind(this)); // admin only
        // stuff (separate from the 3 step queuing)
        this.router.get("/scrape", this.scrapeApartments.bind(this));
        this.router.get("/next_batch_number", this.getNextBatchNumber.bind(this));
        this.router.get("/next_tasks_for_scraper", this.getNextTasksForScraper.bind(this));
        this.router.post("/report_findings_and_mark_complete", this.reportFindingsToDbAndMarkComplete.bind(this));

        // check tasks make sense
        this.router.get("/all", this.getAllTasks.bind(this));
        this.router.delete("/cleanup", this.cleanOldTasks.bind(this));
        this.router.delete("/by_id", this.cleanSpecific.bind(this));
        // this.router.get("/db_contents", )
        this.router.get("/health_check", this.healthCheck.bind(this));
    }

    async scrapeApartments(request: Request, response: Response) {
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return response.status(500).send({ err: "Parameter missing" }).end();
        }
        console.log(city, stateOrProvince, country, "31rm");
        const aps: IHousing[] = await this.scraperService.scrapeApartments(ProviderEnum.rentCanada, city, stateOrProvince, country); // todo: advance from hardcode provider choice
        // TODO: forward request to flask servers
        return response.status(200).send("You made it");
    }

    async getNextBatchNumber(request: Request, response: Response) {
        console.log("30rm");
        const highest = await this.cacheService.getBatchNumForNewBatches();
        if (highest) return response.status(200).json({ nextBatchNum: highest });
        // so this only happens once
        this.cacheService.setBatchNum(0);
        return response.status(200).json({ nextBatchNum: 0 });
    }

    async getGridForScan(request: Request, response: Response) {
        const startCoords: ILatLong = request.body.startCoords;
        const bounds: IBounds = request.body.bounds;
        const radius: number = request.body.radius;
        // not doing input validation here.
        const gridCoords = await this.scraperService.planGrid(startCoords, bounds, radius);
        return response.status(200).json(gridCoords);
    }

    async addGridScanToQueue(request: Request, response: Response) {
        const provider = request.body.provider;
        const coords = request.body.coords;
        const zoomWidth = request.body.zoomWidth;
        const city = request.body.city;
        const batchNum = request.body.batchNum; // admin should have gotten this from the previous endpoint
        // console.log(request.body, "40rm");
        if (provider !== ProviderEnum.rentCanada && provider !== ProviderEnum.rentFaster && provider !== ProviderEnum.rentSeeker) {
            return response.status(400).send("Invalid provider input");
        }
        if (!Array.isArray(coords) || coords.length === 0) {
            return response.status(400).send("Invalid coords input");
        }
        if (typeof zoomWidth !== "number" || zoomWidth < 0) {
            return response.status(400).send("Invalid zoomWidth input");
        }
        if (batchNum === undefined || batchNum === null) return response.status(400).send("batchNum must be defined");
        // "if batchNum is supplied, check if its a number"
        if (batchNum && typeof batchNum !== "number") return response.status(400).send("Invalid batchNum input");

        const queued = await this.taskQueueService.queueGridScan(provider, coords, zoomWidth, city, batchNum);
        // console.log(queued, "54rm");
        return response.status(200).json({ queued });
    }

    async getNextTasksForScraper(request: Request, response: Response) {
        const provider = request.body.provider;
        // Currently batchNum is an OPTIONAL parameter!
        // If specified: Get that batch's unfinished tasks for provider.
        // If not specified: Get ALL unfinished tasks for provider.
        const batchNum = request.body.batchNum; // MIGHT need batch number, but also might not!
        if (provider !== ProviderEnum.rentCanada && provider !== ProviderEnum.rentFaster && provider !== ProviderEnum.rentSeeker) {
            return response.status(400).send("Invalid provider input");
        }

        const tasks: Task[] = await this.taskQueueService.getNextTasksForScraper(provider, batchNum);

        return response.status(200).json({ tasks });
    }

    async reportFindingsToDbAndMarkComplete(request: Request, response: Response) {
        const forProvider: ProviderEnum = request.body.provider;
        const taskId: number = request.body.taskId;
        const apartments: any[] = request.body.apartments;
        console.log(apartments, "121rm");
        if (typeof taskId !== "number" || taskId < 0) {
            return response.status(400).send("Bad task ID input");
        }

        const successfullyLogged = await this.taskQueueService.reportFindingsToDb(forProvider, taskId, apartments);
        const markedComplete = await this.taskQueueService.markTaskComplete(taskId);
        return response.status(200).json({ successfullyLogged, markedComplete, taskId });
    }

    async getAllTasks(request: Request, response: Response) {
        const byProvider = request.body.provider;
        const byBatchNum = request.body.batchNum;
        if (byProvider && typeof byProvider !== "string") return response.status(400).json({ error: "provider must be int" });
        if (byBatchNum && typeof byBatchNum !== "number") return response.status(400).json({ error: "batchNum must be int" });
        if (!byBatchNum && !byProvider) return response.status(400).json({ error: "Missing parameter" });
        const tasks: Task[] = await this.taskQueueService.getAllTasks(byProvider, byBatchNum);
        return response.status(200).json({ tasks });
    }

    async cleanSpecific(request: Request, response: Response) {
        const byArray = request.body.toDelete;
        const byRange = [request.body.start, request.body.end];
        // validation
        const usingByArray = Array.isArray(byRange) && byRange.length > 0 && byArray.every((i: any) => typeof i === "number" && i >= 0);
        const usingByRange = typeof request.body.start === "number" && typeof request.body.end === "number" && byRange[0] < byRange[1];
        if (!usingByArray && !usingByRange) return response.status(400).json({ error: "bad inputs" });
        // service
        const deletedTaskIds: number[] = await this.taskQueueService.cleanSpecific(byArray, byRange);
        return response.status(200).json({ deletedTaskIds });
    }

    async cleanOldTasks(request: Request, response: Response) {
        const deleted = await this.taskQueueService.cleanOldTasks();
        return response.status(200).json({ deleted });
    }

    async healthCheck(request: Request, response: Response) {
        console.log("TaskQueue online");
        return response.status(200).json({ status: "Online" });
    }
}

export default TaskQueueController;
