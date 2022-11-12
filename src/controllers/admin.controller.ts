import express, { Request, Response } from "express";
import { Housing } from "../database/models/Housing";
import { Role } from "../enum/role.enum";
import authorize from "../middleware/authorize.middleware";
import ApartmentService from "../service/apartment.service";
import TaskQueueService from "../service/taskQueue.service";

class AdminController {
    public path = "/admin";
    public router = express.Router();
    private adminService: AdminService;
    private taskQueueService: TaskQueueService;
    private apartmentService: ApartmentService;

    constructor(adminService: AdminService, taskQueueService: TaskQueueService, apartmentService: ApartmentService) {
        this.adminService = adminService;
        this.taskQueueService = taskQueueService;
        this.apartmentService = apartmentService;
        // user stuff
        this.router.post("/user/ban", authorize([Role.Admin]), this.banUser.bind(this));
        // journey
        this.router.get("/user/journey", authorize([Role.Admin]), this.getUserJourney.bind(this));
    }

    public async getTasksByBatchNum(request: Request, response: Response) {
        //
    }

    public async banUser(request: Request, response: Response) {
        // admin service
    }

    public async getUserJourney(request: Request, response: Response) {
        // journey
    }
}
