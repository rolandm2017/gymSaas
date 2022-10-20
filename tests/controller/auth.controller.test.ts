import express, { NextFunction, Request, Response } from "express";

import { IBasicDetails } from "../../src/interface/BasicDetails.interface";

import AuthController from "../../src/controllers/auth.controller";
import AuthService from "../../src/service/auth.service";
import { Role } from "../../src/enum/role.enum";

let s: AuthService;
let controller: AuthController;

const validEmail = "someValidEmail@gmail.com";
const fakeButValidAccount: IBasicDetails = {
    id: 999999,
    email: validEmail,
    isVerified: true,
    updated: 0,
    role: Role.User,
};

beforeAll(() => {
    s = new AuthService();

    controller = new AuthController(s);
});

const mockResponse = () => {
    // from https://github.com/HugoDF/mock-express-request-response/blob/master/express-handlers.jest-test.js
    // and from https://codewithhugo.com/express-request-response-mocking/
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Test auth controller", () => {
    test("authenticate route succeeds for valid inputs", async () => {
        s.authenticate = jest.fn().mockReturnValue(fakeButValidAccount);
        const req: Request = { body: {} } as Request;
        req.body.email = "someValidEmail@gmail.com";
        req.body.password = "validPassword999*";
        req.ip = "195.1.1.3";
        const res: Response = mockResponse();
        const resJsonMock = jest.fn();
        res.json = resJsonMock;
        const n: NextFunction = {} as NextFunction;
        const response: Response = await controller.authenticate(req, res, n);
        // expect(response.email).toEqual(validEmail);
        expect(resJsonMock).toHaveBeenCalledWith({
            accountDetails: fakeButValidAccount,
        });
        expect(res.json).toHaveBeenCalled();
    });
    test("authenticate route errors for invalid inputs", async () => {
        s.authenticate = jest.fn().mockReturnValue({ error: "hats" });
        const req: Request = {} as Request;
        const res: Response = mockResponse();
        const resJsonMock = jest.fn();
        res.json = resJsonMock;
        const n: NextFunction = {} as NextFunction;
        req.body = {
            email: "hats@gmail.com",
        };
        const response = await controller.authenticate(req, res, n);
        expect(resJsonMock).toHaveBeenCalledWith({ error: "hats" });
        expect(resJsonMock).toHaveBeenCalled();
    });

    test("register route succeeds for valid inputs", async () => {
        s.register = jest.fn().mockReturnValue(fakeButValidAccount);
        const req: any = {};
        req.get = function () {
            return "hats";
        };
        const res: Response = mockResponse();
        res.json = jest.fn();
        const n: NextFunction = {} as NextFunction;
        const response = await controller.register(req, res, n);
        expect(res.json).toHaveBeenCalled();
    });
    test("register route errors for invalid inputs", async () => {
        s.register = jest.fn().mockReturnValue({ error: "hats" });
        const req: any = {};
        req.get = function () {
            return "hats";
        };
        const res: Response = mockResponse();
        res.json = jest.fn();
        const n: NextFunction = {} as NextFunction;
        const response = await controller.register(req, res, n);
        expect(res.json).toHaveBeenCalledWith({
            error: "hats",
        });
        expect(res.json).toHaveBeenCalled();
    });
});
