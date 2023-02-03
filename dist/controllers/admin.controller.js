"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const role_enum_1 = require("../enum/role.enum");
const healthCheck_enum_1 = require("../enum/healthCheck.enum");
const authorize_middleware_1 = __importDefault(require("../middleware/authorize.middleware"));
const handleErrorResponse_1 = require("../util/handleErrorResponse");
const inputValidation_1 = require("../validationSchemas/inputValidation");
class AdminController {
    constructor(adminService, taskQueueService, housingService) {
        this.path = "/admin";
        this.router = express_1.default.Router();
        this.adminService = adminService;
        this.taskQueueService = taskQueueService;
        this.housingService = housingService;
        // todo: remove access to housing service, for organizational purposes...
        // todo: ...make admin service use housing service.
        // batches, apartments, for admin panel
        this.router.get("/batches/all", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.getAllBatchNumbers.bind(this));
        this.router.get("/task-queue/all", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.getAllTasks.bind(this));
        // "/admin/task-queue/tasks-by-batch-num";
        this.router.get("/task-queue/tasks-by-batch-num-and-city-name", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.getTasksByWithSpecifications.bind(this));
        this.router.get("/housing/by-location", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.getApartmentsByLocation.bind(this));
        this.router.get("/housing/by-city-id-and-batch-num", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.getApartmentsByCityIdAndBatchNum.bind(this));
        // user stuff
        this.router.post("/user/ban", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.banUser.bind(this));
        this.router.post("/user/make-admin", this.makeAdmin.bind(this));
        // todo: endpoint to view a user's picks and revealed urls, and credits, as admin
        // journey
        this.router.get("/user/journey", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.getUserJourney.bind(this));
        // health check
        this.router.get(healthCheck_enum_1.HealthCheck.healthCheck, this.healthCheck);
    }
    getAllBatchNumbers(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const batchNums = yield this.taskQueueService.getAllBatchNumbers();
            return response.status(200).json({ batchNums });
        });
    }
    getAllTasks(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const providerInput = request.query.provider; // optional
                const batchNumInput = request.query.batchNum; // optional
                const cityIdInput = request.query.cityId; // optional
                const provider = providerInput ? (0, inputValidation_1.isProvider)(providerInput) : undefined;
                const batchNum = batchNumInput ? (0, inputValidation_1.isStringInteger)(batchNumInput) : undefined;
                const cityId = cityIdInput ? (0, inputValidation_1.isStringInteger)(cityIdInput) : undefined;
                const tasks = yield this.taskQueueService.getAllTasks(provider, batchNum, cityId);
                return response.status(200).json({ tasks });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getApartmentsByLocation(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cityNameInput = request.query.cityName;
                const cityName = (0, inputValidation_1.isString)(cityNameInput);
                const aps = yield this.housingService.getApartmentsByLocation(cityName);
                return response.status(200).json({ apartments: aps });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getApartmentsByCityIdAndBatchNum(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cityIdInput = request.query.cityId;
                const batchNumInput = request.query.batchNum;
                const cityId = (0, inputValidation_1.isStringInteger)(cityIdInput);
                const batchNum = (0, inputValidation_1.isStringInteger)(batchNumInput);
                const aps = yield this.housingService.getHousingByCityIdAndBatchNum(cityId, batchNum);
                // todo: make admin controller have access to the urls. but only the admin controller & getRealURL & getRevealedList
                return response.status(200).json({ apartments: aps });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getTasksByWithSpecifications(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const batchNumInput = request.query.batchNum;
            const cityNameInput = request.query.cityName;
            const providerInput = request.query.provider;
            const successFilterInput = request.query.successFilter;
            try {
                const batchNum = (0, inputValidation_1.isStringInteger)(batchNumInput);
                const cityName = (0, inputValidation_1.isString)(cityNameInput);
                const providerOrAll = (0, inputValidation_1.isProviderOrAll)(providerInput);
                const successFilter = (0, inputValidation_1.isASuccessFilter)(successFilterInput);
                const tasks = yield this.taskQueueService.getTasksByWithSpecifications(batchNum, cityName, providerOrAll, successFilter);
                return response.status(200).json({ tasks });
            }
            catch (err) {
                console.log({ batchNumInput, cityNameInput, providerInput, successFilterInput });
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    banUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const acctIdInput = request.query.acctId;
                const acctId = (0, inputValidation_1.isStringInteger)(acctIdInput);
                const success = yield this.adminService.banUser(acctId);
                return response.status(200).json({ success });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    makeAdmin(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newAdminEmailInput = request.body.email;
                const newAdminEmail = (0, inputValidation_1.isEmail)(newAdminEmailInput);
                const success = this.adminService.makeAdmin(newAdminEmail); // works until there is an admin in the system
                return response.status(200).json({ success });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getUserJourney(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            // journey - add much later
        });
    }
    healthCheck(request, response) {
        return response.status(200).json({ message: "active" });
    }
}
exports.default = AdminController;
