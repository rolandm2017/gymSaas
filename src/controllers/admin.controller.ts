import express, { Request, Response } from "express";
import { Housing } from "../database/models/Housing";
import { Task } from "../database/models/Task";
import { ProviderEnum } from "../enum/provider.enum";
import { Role } from "../enum/role.enum";
import { HealthCheck } from "../enum/healthCheck.enum";
import authorize from "../middleware/authorize.middleware";
import AdminService from "../service/admin.service";
import HousingService from "../service/housing.service";
import TaskQueueService from "../service/taskQueue.service";
import { handleErrorResponse } from "../util/responses/handleErrorResponse";

class AdminController {
    public path = "/admin";
    public router = express.Router();
    private adminService: AdminService;
    private taskQueueService: TaskQueueService;
    private housingService: HousingService;

    constructor(adminService: AdminService, taskQueueService: TaskQueueService, housingService: HousingService) {
        this.adminService = adminService;
        this.taskQueueService = taskQueueService;
        this.housingService = housingService;
        // batches, apartments
        this.router.get("/batches/all", authorize([Role.Admin]), this.getAllBatchNumbers.bind(this));
        this.router.get("/task-queue/all", authorize([Role.Admin]), this.getAllTasks.bind(this));
        this.router.get("/housing/by-location", authorize([Role.Admin]), this.getApartmentsByLocation.bind(this));
        this.router.get("/housing/by-city-id-and-batch-num", authorize([Role.Admin]), this.getApartmentsByCityIdAndBatchNum.bind(this));
        // **
        // note the authorization is turned off
        // this.router.get("/batches/all", this.getAllBatchNumbers.bind(this));
        // this.router.get("/task-queue/all", this.getAllTasks.bind(this));
        // this.router.get("/task-queue/tasks-by-batch-num", this.getTasksByBatchNum.bind(this));
        // this.router.get("/housing/by-location", this.getApartmentsByLocation.bind(this));
        // this.router.get("/housing/by-city-id-and-batch-num", this.getApartmentsByCityIdAndBatchNum.bind(this));
        // user stuff
        this.router.post("/user/ban", authorize([Role.Admin]), this.banUser.bind(this));
        this.router.post("/user/make-admin", this.makeAdmin.bind(this));
        // journey
        this.router.get("/user/journey", authorize([Role.Admin]), this.getUserJourney.bind(this));
        // health check
        this.router.get(HealthCheck.healthCheck, this.healthCheck);
    }

    public async getAllBatchNumbers(request: Request, response: Response) {
        const batchNums: number[] = await this.taskQueueService.getAllBatchNumbers();
        return response.status(200).json({ batchNums });
    }

    public async getAllTasks(request: Request, response: Response) {
        try {
            const providerInput = request.query.provider; // optional
            const batchNumInput = request.query.batchNum; // optional
            const cityIdInput = request.query.cityId; // optional
            // validation
            if (providerInput && typeof providerInput !== "string") return handleErrorResponse(response, "invalid provider");
            const provider = providerInput && providerInput in ProviderEnum ? (providerInput as ProviderEnum) : undefined;
            if (batchNumInput && typeof batchNumInput !== "string") return handleErrorResponse(response, "invalid batchNum");
            const batchNum = batchNumInput ? parseInt(batchNumInput, 10) : undefined;
            if (cityIdInput && typeof cityIdInput !== "string") return handleErrorResponse(response, "invalid cityId");
            const cityId = cityIdInput ? parseInt(cityIdInput, 10) : undefined;
            //
            const tasks: Task[] = await this.taskQueueService.getAllTasks(provider, batchNum, cityId);
            return response.status(200).json({ tasks });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getApartmentsByLocation(request: Request, response: Response) {
        try {
            const cityName = request.query.cityName;
            // do I need by country or state? YAGNI?
            if (typeof cityName !== "string") return handleErrorResponse(response, "cityName must be string");
            const aps: Housing[] = await this.housingService.getApartmentsByLocation(cityName);
            return response.status(200).json({ apartments: aps });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getApartmentsByCityIdAndBatchNum(request: Request, response: Response) {
        try {
            const cityIdInput = request.query.cityId;
            const batchNumInput = request.query.batchNum;
            if (typeof cityIdInput !== "string") return handleErrorResponse(response, "cityId must be a string integer");
            if (typeof batchNumInput !== "string") return handleErrorResponse(response, "batchNum must be a string integer");
            const cityId = parseInt(cityIdInput, 10);
            const batchNum = parseInt(batchNumInput, 10);
            const cityIdIsNaN = isNaN(cityId);
            const batchNumIsNaN = isNaN(batchNum);
            if (cityIdIsNaN || batchNumIsNaN) return handleErrorResponse(response, "cityId and batchNum must be int");
            if (!cityId || !batchNum) return handleErrorResponse(response, "must provide both cityId and batchNum");
            const aps: Housing[] = await this.housingService.getHousingByCityIdAndBatchNum(cityId, batchNum);
            return response.status(200).json({ apartments: aps });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getTasksByBatchNum(request: Request, response: Response) {
        try {
            const batchNumInput = request.query.batchNum;
            if (batchNumInput === undefined || typeof batchNumInput !== "string") return handleErrorResponse(response, "must supply batchNum");
            // todo: validation
            const batchNum = parseInt(batchNumInput, 10);
            if (isNaN(batchNum)) return handleErrorResponse(response, "batchNum must be an integer");
            const tasks: Task[] = await this.taskQueueService.getTasksByBatchNum(batchNum);
            return response.status(200).json({ tasks });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async banUser(request: Request, response: Response) {
        try {
            const acctIdInput = request.query.acctId;
            if (acctIdInput === undefined || typeof acctIdInput !== "string") return handleErrorResponse(response, "must supply acctId");
            const acctId = parseInt(acctIdInput, 10);
            if (isNaN(acctId)) return handleErrorResponse(response, "acctId must be an integer");
            const success = await this.adminService.banUser(acctId);
            return response.status(200).json({ success });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async makeAdmin(request: Request, response: Response) {
        try {
            const newAdminEmail = request.body.email;
            if (newAdminEmail === undefined || typeof newAdminEmail !== "string") return handleErrorResponse(response, "must provide email");
            const success = this.adminService.makeAdmin(newAdminEmail); // works until there is an admin in the system
            return response.status(200).json({ success });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getUserJourney(request: Request, response: Response) {
        // journey - add much later
    }

    public healthCheck(request: Request, response: Response) {
        return response.status(200).json({ message: "active" });
    }
}

export default AdminController;
