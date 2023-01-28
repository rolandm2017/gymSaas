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
import { handleErrorResponse } from "../util/handleErrorResponse";
import { isEmail, isProvider, isProviderOrAll, isString, isStringInteger } from "../validationSchemas/inputValidation";
import { IHousing } from "../interface/Housing.interface";
import { ProvinceIdEnum } from "../enum/canadaProvinceId.enum";

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
        // todo: remove access to housing service, for organizational purposes...
        // todo: ...make admin service use housing service.
        // batches, apartments, for admin panel
        this.router.get("/batches/all", authorize([Role.Admin]), this.getAllBatchNumbers.bind(this));
        this.router.get("/task-queue/all", authorize([Role.Admin]), this.getAllTasks.bind(this));
        // "/admin/task-queue/tasks-by-batch-num";
        this.router.get("/task-queue/tasks-by-batch-num-and-city-name", authorize([Role.Admin]), this.getTasksByWithSpecifications.bind(this));
        this.router.get("/housing/by-location", authorize([Role.Admin]), this.getApartmentsByLocation.bind(this));
        this.router.get("/housing/by-city-id-and-batch-num", authorize([Role.Admin]), this.getApartmentsByCityIdAndBatchNum.bind(this));
        // user stuff
        this.router.post("/user/ban", authorize([Role.Admin]), this.banUser.bind(this));
        this.router.post("/user/make-admin", this.makeAdmin.bind(this));
        // todo: endpoint to view a user's picks and revealed urls, and credits, as admin
        // journey
        this.router.get("/user/journey", authorize([Role.Admin]), this.getUserJourney.bind(this));
        // health check
        this.router.get(HealthCheck.healthCheck, this.healthCheck);
    }

    public async getAllBatchNumbers(request: Request, response: Response) {
        console.log("getting all batches 51rm");
        const batchNums: number[] = await this.taskQueueService.getAllBatchNumbers();
        return response.status(200).json({ batchNums });
    }

    public async getAllTasks(request: Request, response: Response) {
        try {
            const providerInput = request.query.provider; // optional
            const batchNumInput = request.query.batchNum; // optional
            const cityIdInput = request.query.cityId; // optional
            const provider = providerInput ? isProvider(providerInput) : undefined;
            const batchNum = batchNumInput ? isStringInteger(batchNumInput) : undefined;
            const cityId = cityIdInput ? isStringInteger(cityIdInput) : undefined;
            const tasks: Task[] = await this.taskQueueService.getAllTasks(provider, batchNum, cityId);
            return response.status(200).json({ tasks });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getApartmentsByLocation(request: Request, response: Response) {
        try {
            const cityNameInput = request.query.cityName;
            const cityName = isString(cityNameInput);
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
            const cityId = isStringInteger(cityIdInput);
            const batchNum = isStringInteger(batchNumInput);
            const aps: IHousing[] = await this.housingService.getHousingByCityIdAndBatchNum(cityId, batchNum);
            // todo: make admin controller have access to the urls. but only the admin controller & getRealURL & getRevealedList
            return response.status(200).json({ apartments: aps });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getTasksByWithSpecifications(request: Request, response: Response) {
        try {
            const batchNumInput = request.query.batchNum;
            const cityNameInput = request.query.cityName;
            const providerInput = request.query.provider;
            console.log(batchNumInput, cityNameInput, providerInput, "98rm");
            const batchNum = isStringInteger(batchNumInput);
            const cityName = isString(cityNameInput);
            const providerOrAll = isProviderOrAll(providerInput);
            // console.log(batchNum, cityName, providerOrAll, "102rm");
            const tasks: Task[] = await this.taskQueueService.getTasksByWithSpecifications(batchNum, cityName, providerOrAll);
            // console.log(`returning tasks of length ${tasks.length}, '104rm'`);
            return response.status(200).json({ tasks });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async banUser(request: Request, response: Response) {
        try {
            const acctIdInput = request.query.acctId;
            const acctId = isStringInteger(acctIdInput);
            const success = await this.adminService.banUser(acctId);
            return response.status(200).json({ success });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async makeAdmin(request: Request, response: Response) {
        try {
            const newAdminEmailInput = request.body.email;
            const newAdminEmail = isEmail(newAdminEmailInput);
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
