// todo: access token for an admin account;
import express, { NextFunction, Request, Response } from "express";

import AdminController from "../../src/controllers/admin.controller";
import AdminService from "../../src/service/admin.service";
import TaskQueueService from "../../src/service/taskQueue.service";
import ApartmentService from "../../src/service/apartment.service";
import AccountDAO from "../../src/database/dao/account.dao";
import CityDAO from "../../src/database/dao/city.dao";
import BatchDAO from "../../src/database/dao/batch.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import StateDAO from "../../src/database/dao/state.dao";
import { request } from "http";

let accountDAO: AccountDAO;
let cityDAO: CityDAO;
let stateDAO: StateDAO;
let batchDAO: BatchDAO;
let housingDAO: HousingDAO;
let taskDAO: TaskDAO;

let adminService: AdminService;
let taskQueueService: TaskQueueService;
let apartmentService: ApartmentService;

let controller: AdminController;

beforeAll(() => {
    // dao
    accountDAO = new AccountDAO();
    cityDAO = new CityDAO();
    stateDAO = new StateDAO();
    batchDAO = new BatchDAO();
    housingDAO = new HousingDAO(stateDAO, cityDAO);
    taskDAO = new TaskDAO();

    // service
    adminService = new AdminService(accountDAO);
    taskQueueService = new TaskQueueService(cityDAO, housingDAO, batchDAO, taskDAO);
    apartmentService = new ApartmentService(housingDAO);

    controller = new AdminController(adminService, taskQueueService, apartmentService);
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
        // requires at least one of cityName or stateName, and in either case, it must be a string
        // case 1: neither
        const req: Request = { query: {}, body: {} } as Request;

        const res: Response = mockResponse();
        res.json = jest.fn();
        await controller.getApartmentsByLocation(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "at least one of cityName or state must be provided" });
        // case 2: both but ... wait, any string will do ... nevermind, no 2nd case
    });
    test("getApartmentsByCityIdAndBatchNum", async () => {
        // requires cityId and batchNum to both be integers
        // case: neither is supplied
        const res1: Response = mockResponse();
        res1.json = jest.fn();
        expect(res1.json).toHaveBeenCalled();
        expect(res1.json).toHaveBeenCalledWith({ error: "placeholder" });

        // case: batchNum is not int
        const req: Request = { query: {}, body: {} } as Request;
        req.query.cityId = "5";
        req.query.batchNum = "hats"; // fails
        const res2: Response = mockResponse();
        res2.json = jest.fn();
        await controller.getApartmentsByCityIdAndBatchNum(req, res2);
        expect(res2.json).toHaveBeenCalled();
        expect(res2.json).toHaveBeenCalledWith({ error: "placeholder" });

        // case: cityId is not int
        const req2: Request = { query: {}, body: {} } as Request;
        req2.query.cityId = "foo"; // fails
        req2.query.batchNum = "1";
        const res3: Response = mockResponse();
        res3.json = jest.fn();
        await controller.getApartmentsByCityIdAndBatchNum(req2, res3);
        expect(res3.json).toHaveBeenCalled();
        expect(res3.json).toHaveBeenCalledWith({ error: "placeholder" });
    });
    test("getTasksByBatchNum", async () => {
        // requires batchNum field to be an integer
        const req: Request = { query: {}, body: {} } as Request;
        req.query.batchNum = undefined;
        const res: Response = mockResponse();
        res.json = jest.fn();
        await controller.getTasksByBatchNum(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "must supply acctId" });

        // test version 2
        jest.clearAllMocks();
        const res2: Response = mockResponse();
        res2.json = jest.fn();
        req.query.batchNum = "hats";
        await controller.getTasksByBatchNum(req, res2);
        expect(res.json).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ error: "acctId must be an integer" });
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
