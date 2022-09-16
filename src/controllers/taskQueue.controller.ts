import express, { Request, Response } from "express";
import { ProviderEnum } from "../enum/provider.enum";
import { ITask } from "../interface/Task.interface";
import TaskQueueService from "../service/taskQueue.service";

class TaskQueueController {
    public path = "/queue";
    public router = express.Router();

    constructor() {
        this.router.post("/gridScan", this.addGridScanToQueue);
        this.router.get("/nextTaskForScraper", this.getNextTaskForScraper);
        this.router.post("/markTaskComplete", this.markTaskComplete);
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
            return response.status(400).send("Invalid batchNum input");
        }

        const taskQueue = new TaskQueueService();
        const task: ITask = await taskQueue.getNextTaskForScraper(provider, batchNum);

        return response.status(200).json(task);
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
}

export default TaskQueueController;
