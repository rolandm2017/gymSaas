import express, { Request, Response } from "express";
import { Task } from "../database/models/Task";
import { ProviderEnum } from "../enum/provider.enum";
import { ITask } from "../interface/Task.interface";
import TaskQueueService from "../service/taskQueue.service";

class TaskQueueController {
    public path = "/task_queue";
    public router = express.Router();
    private taskQueueService: TaskQueueService;

    // todo in production: mark several routes "admin only" like authorize([Role.Admin])

    constructor(taskQueueService: TaskQueueService) {
        this.taskQueueService = taskQueueService;
        // step 3 of 3 in queuing a scrape
        this.router.post("/queue_grid_scan", this.addGridScanToQueue.bind(this)); // admin only
        this.router.get("/next_tasks_for_scraper", this.getNextTasksForScraper.bind(this));
        this.router.post("/report_findings_and_mark_complete", this.reportFindingsToDbAndMarkComplete.bind(this));
        // this.router.post("/mark_task_complete", this.markTaskComplete.bind(this));
        // check tasks make sense
        this.router.get("/all", this.getAllTasks.bind(this));
        this.router.delete("/cleanup", this.cleanOldTasks.bind(this));
        // this.router.get("/db_contents", )
        this.router.get("/health_check", this.healthCheck);
    }

    async addGridScanToQueue(request: Request, response: Response) {
        const provider = request.body.provider;
        const coords = request.body.coords;
        const zoomWidth = request.body.zoomWidth;
        // const batchNum // todo: implement and pass down into task creation
        const city = request.body.city;
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

        const queued = await this.taskQueueService.queueGridScan(provider, coords, zoomWidth, city);

        return response.status(200).json(queued);
    }

    async getNextTasksForScraper(request: Request, response: Response) {
        const provider = request.body.provider;
        const batchNum = request.body.batchNum;
        console.log(provider, batchNum, "52rm");
        if (provider !== ProviderEnum.rentCanada && provider !== ProviderEnum.rentFaster && provider !== ProviderEnum.rentSeeker) {
            return response.status(400).send("Invalid provider input");
        }
        if (batchNum && typeof batchNum !== "number") {
            // "if batchNum is supplied, check if its a number"
            return response.status(400).send("Invalid batchNum input");
        }

        const tasks: Task[] = await this.taskQueueService.getNextTasksForScraper(provider, batchNum);

        return response.status(200).json(tasks);
    }

    async reportFindingsToDbAndMarkComplete(request: Request, response: Response) {
        // todo: fill me in
        const forProvider: ProviderEnum = request.body.provider;
        const taskId: number = request.body.taskId;
        const apartments: any[] = request.body.apartments;

        if (typeof taskId !== "number" || taskId < 0) {
            return response.status(400).send("Bad task ID input");
        }

        const successfullyLogged = await this.taskQueueService.reportFindingsToDb(forProvider, taskId, apartments);
        const markedComplete = await this.taskQueueService.markTaskComplete(taskId);
        return response.status(200).json({ successfullyLogged, markedComplete });
    }

    async getAllTasks(request: Request, response: Response) {
        const choice = request.body.provider;
        console.log(choice, "83rm");
        const all = await this.taskQueueService.getAllTasks(choice);
        return response.status(200).json({ all: all });
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
