import express, { NextFunction, Request, Response } from "express";

import AdminController from "../../src/controllers/admin.controller";
import AdminService from "../../src/service/admin.service";
import TaskQueueService from "../../src/service/taskQueue.service";
import HousingService from "../../src/service/housing.service";
import AccountDAO from "../../src/database/dao/account.dao";
import CityDAO from "../../src/database/dao/city.dao";
import BatchDAO from "../../src/database/dao/batch.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import StateDAO from "../../src/database/dao/state.dao";
import CacheService from "../../src/service/cache.service";
import GymDAO from "../../src/database/dao/gym.dao";

let accountDAO: AccountDAO;
let cityDAO: CityDAO;
let stateDAO: StateDAO;
let housingDAO: HousingDAO;
let taskDAO: TaskDAO;
let gymDAO: GymDAO;

let adminService: AdminService;
let taskQueueService: TaskQueueService;
let housingService: HousingService;
let cacheService: CacheService;

let controller: AdminController;

beforeAll(() => {
    // dao
    accountDAO = new AccountDAO();
    cityDAO = new CityDAO();
    stateDAO = new StateDAO();
    housingDAO = new HousingDAO(stateDAO, cityDAO);
    taskDAO = new TaskDAO();
    gymDAO = new GymDAO();

    // service
    adminService = new AdminService(accountDAO);
    taskQueueService = new TaskQueueService(cityDAO, housingDAO, taskDAO, cacheService);
    housingService = new HousingService(housingDAO, gymDAO, cacheService);

    controller = new AdminController(adminService, taskQueueService, housingService);
});

afterEach(() => {
    jest.clearAllMocks();
});

const mockResponse = () => {
    // from https://github.com/HugoDF/mock-express-request-response/blob/master/express-handlers.jest-test.js
    // and from https://codewithhugo.com/express-request-response-mocking/
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => {
    jest.clearAllMocks();
});

// todo: test admin controller in /routes - make sure you really need admin credentials

describe("invalid inputs yield an error about the input being invalid", () => {
    test("getAllTasks", async () => {
        //
    });
    test("getApartmentsByLocation", async () => {
        const req: Request = { query: {}, body: {} } as Request;
        const res: Response = mockResponse();
        res.json = jest.fn();
        await controller.getApartmentsByLocation(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "cityName must be string" });
    });
    test("getApartmentsByCityIdAndBatchNum", async () => {
        // requires cityId and batchNum to both be integers
        // case: neither is supplied
        const req1: Request = { query: {}, body: {} } as Request;
        const res1: Response = mockResponse();
        res1.json = jest.fn();
        await controller.getApartmentsByCityIdAndBatchNum(req1, res1);
        expect(res1.json).toHaveBeenCalled();
        expect(res1.json).toHaveBeenCalledWith({ error: "cityId must be a string integer" }); // this error is fine

        // case: batchNum is not int
        const req2: Request = { query: {}, body: {} } as Request;
        req2.query.cityId = "5";
        req2.query.batchNum = "hats"; // fails
        const res2: Response = mockResponse();
        res2.json = jest.fn();
        await controller.getApartmentsByCityIdAndBatchNum(req2, res2);
        expect(res2.json).toHaveBeenCalled();
        expect(res2.json).toHaveBeenCalledWith({ error: "cityId and batchNum must be int" });

        // case: cityId is not int
        const req3: Request = { query: {}, body: {} } as Request;
        req3.query.cityId = "foo"; // fails
        req3.query.batchNum = "1";
        const res3: Response = mockResponse();
        res3.json = jest.fn();
        await controller.getApartmentsByCityIdAndBatchNum(req3, res3);
        expect(res3.json).toHaveBeenCalled();
        expect(res3.json).toHaveBeenCalledWith({ error: "cityId and batchNum must be int" });
    });
    test("getTasksByBatchNum", async () => {
        // requires batchNum field to be an integer
        const req: Request = { query: {}, body: {} } as Request;
        req.query.batchNum = undefined;
        const res: Response = mockResponse();
        res.json = jest.fn();
        await controller.getTasksByBatchNum(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "must supply batchNum" });

        // test version 2
        jest.clearAllMocks();
        const res2: Response = mockResponse();
        res2.json = jest.fn();
        req.query.batchNum = "hats";
        await controller.getTasksByBatchNum(req, res2);
        expect(res2.json).toHaveBeenCalled();
        expect(res2.json).toHaveBeenCalledWith({ error: "batchNum must be an integer" });
    });
    test("banUser", async () => {
        // requires acctId field to be an integer
        const req: Request = { query: {}, body: {} } as Request;
        req.query.acctId = undefined;
        const res: Response = mockResponse();
        res.json = jest.fn();
        await controller.banUser(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "must supply acctId" });

        // test version 2
        jest.clearAllMocks();
        req.query.acctId = "hats";
        await controller.banUser(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "acctId must be an integer" });
    });
    test("makeAdmin", async () => {
        // requires email field
        const req: Request = { query: {}, body: {} } as Request;
        // req.query.email = "someString" // it would work if this string was provided
        const res: Response = mockResponse();
        res.json = jest.fn();
        await controller.makeAdmin(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "must provide email" });
    });
});
