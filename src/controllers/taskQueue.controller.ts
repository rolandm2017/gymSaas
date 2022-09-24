import express, { Request, Response } from "express";
import { ProviderEnum } from "../enum/provider.enum";
import { ITask } from "../interface/Task.interface";
import TaskQueueService from "../service/taskQueue.service";

class TaskQueueController {
    public path = "/task_queue";
    public router = express.Router();

    constructor() {
        this.router.post("/grid_scan", this.addGridScanToQueue);
        this.router.get("/next_task_for_scraper", this.getNextTaskForScraper);
        this.router.post("/report_findings", this.reportFindingsToDb);
        this.router.post("/mark_task_complete", this.markTaskComplete);
        this.router.delete("/cleanup", this.cleanOldTasks);
        this.router.get("/health_check", this.healthCheck);
    }

    async addGridScanToQueue(request: Request, response: Response) {
        const provider = request.body.provider;
        const coords = request.body.coords;
        const zoomWidth = request.body.zoomWidth;
        // todo: validation
        if (provider !== ProviderEnum.rentCanada && provider !== ProviderEnum.rentFaster && provider !== ProviderEnum.rentSeeker) {
            return response.status(400).send("Invalid provider input");
        }
        if (!Array.isArray(coords) || coords.length === 0) {
            return response.status(400).send("Invalid coords input");
        }
        if (typeof zoomWidth !== "number" || zoomWidth < 0) {
            return response.status(400).send("Invalid zoomWidth input");
        }

        const taskQueue = new TaskQueueService();
        const queued = await taskQueue.queueGridScan(provider, coords, zoomWidth);

        return response.status(200).json(queued);
    }

    async getNextTaskForScraper(request: Request, response: Response) {
        const provider = request.body.provider;
        const batchNum = request.body.batchNum;
        if (provider !== ProviderEnum.rentCanada && provider !== ProviderEnum.rentFaster && provider !== ProviderEnum.rentSeeker) {
            return response.status(400).send("Invalid provider input");
        }
        if (batchNum && typeof batchNum !== "number") {
            // "if batchNum is supplied, check if its a number"
            return response.status(400).send("Invalid batchNum input");
        }

        const taskQueue = new TaskQueueService();
        const task: ITask = await taskQueue.getNextTaskForScraper(provider, batchNum);

        return response.status(200).json(task);
    }

    async reportFindingsToDb(request: Request, response: Response) {
        // todo: fill me in
    }

    async markTaskComplete(request: Request, response: Response) {
        const taskId = request.body.taskId;
        if (typeof taskId !== "number" || taskId < 0) {
            return response.status(400).send("Bad task ID input");
        }
        const taskQueue = new TaskQueueService();
        const complete = await taskQueue.markTaskComplete(taskId);

        return response.status(200).json({ complete });
    }

    async cleanOldTasks(request: Request, response: Response) {
        const taskQueue = new TaskQueueService();
        const deleted = await taskQueue.cleanOldTasks();

        return response.status(200).json({ deleted });
    }

    async healthCheck(request: Request, response: Response) {
        console.log("TaskQueue online");
        return response.status(200).json({ status: "Online" });
    }
}

export default TaskQueueController;
