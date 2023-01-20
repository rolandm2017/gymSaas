import { NextFunction, Request, Response } from "express";

import { IBasicDetails } from "../../src/interface/BasicDetails.interface";

import AuthController from "../../src/controllers/auth.controller";
import AuthService from "../../src/service/auth.service";
import { Role } from "../../src/enum/role.enum";
import EmailService from "../../src/service/email.service";
import AccountUtil from "../../src/util/accountUtil";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";
import AccountDAO from "../../src/database/dao/account.dao";
import sendEmail from "../../src/util/sendEmail";
import RefreshTokenDAO from "../../src/database/dao/refreshToken.dao";
import ProfileDAO from "../../src/database/dao/profile.dao";
import { FREE_CREDITS } from "../../src/util/constants";

let authService: AuthService;
let controller: AuthController;
let accountDAO: AccountDAO = new AccountDAO();
const profileDAO: ProfileDAO = new ProfileDAO();
let emailService: EmailService = new EmailService(sendEmail, "testing");
let resetTokenDAO: ResetTokenDAO = new ResetTokenDAO(accountDAO);
const refreshTokenDAO = new RefreshTokenDAO();
let accountUtil: AccountUtil = new AccountUtil(refreshTokenDAO);

const validEmail = "someValidEmail@gmail.com";
const fakeButValidAccount: IBasicDetails = {
    acctId: 999999,
    email: validEmail,
    isVerified: true,
    updated: 0,
    role: Role.User,
    jwtToken: "testToken",
    refreshToken: "fakeTestToken",
    name: "Foobar Baz",
    credits: FREE_CREDITS,
};

beforeAll(() => {
    authService = new AuthService(emailService, accountUtil, accountDAO, profileDAO, resetTokenDAO, refreshTokenDAO);

    controller = new AuthController(authService);
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

describe("Test auth controller without services", () => {
    test("authenticate route succeeds for valid inputs", async () => {
        const credentialsWithJwtAndRefreshToken = { ...fakeButValidAccount };
        authService.authenticate = jest.fn().mockReturnValue(credentialsWithJwtAndRefreshToken);
        controller = new AuthController(authService);
        const req: Request = { body: {} } as Request;
        req.body.email = "someValidEmail@gmail.com";
        req.body.password = "validPassword999*";
        req.ip = "195.1.1.35";
        const res: Response = mockResponse();
        res.json = jest.fn();
        res.cookie = jest.fn();
        const next: NextFunction = {} as NextFunction;
        const response: Response = await controller.authenticate(req, res, next);
        // expect(response.email).toEqual(validEmail);
        expect(res.json).toHaveBeenCalledWith({
            ...fakeButValidAccount,
        });
        expect(res.json).toHaveBeenCalled();
        expect(res.cookie).toHaveBeenCalled();
    });
    test("authenticate route errors for invalid inputs", async () => {
        authService.authenticate = jest.fn().mockReturnValue({ error: "someTestValue22" });
        const req: Request = {} as Request;
        const res: Response = mockResponse();
        res.json = jest.fn();
        // const n: NextFunction = {} as NextFunction;
        req.body = {
            email: "hats@gmail.com",
            password: "aValidPw99##",
        };
        const n: NextFunction = {} as NextFunction;
        // ready
        const response = await controller.authenticate(req, res, n);
        expect(res.json).toHaveBeenCalledWith({ error: "someTestValue22" });
        expect(res.json).toHaveBeenCalled();
    });

    test("register route succeeds for valid inputs", async () => {
        authService.register = jest.fn().mockReturnValue(fakeButValidAccount);
        const req: any = {};
        req.get = function () {
            return "fictionalOriginForTest";
        };
        const res: Response = mockResponse();
        res.json = jest.fn();
        const n: NextFunction = {} as NextFunction;
        // ready
        const response = await controller.register(req, res, n);
        expect(res.json).toHaveBeenCalledWith({
            message: "Registration successful, please check your email for verification instructions",
            accountDetails: fakeButValidAccount,
        });
        expect(res.json).toHaveBeenCalled();
    });
    test("register route errors for invalid inputs", async () => {
        authService.register = jest.fn().mockReturnValue({ error: "the_error_msg_is_passed_properly" });
        const req: any = {};
        req.get = function () {
            return "fictionalOriginForTest2";
        };
        const res: Response = mockResponse();
        res.json = jest.fn();
        const n: NextFunction = {} as NextFunction;
        // ready
        const response = await controller.register(req, res, n);
        expect(res.json).toHaveBeenCalledWith({
            error: "the_error_msg_is_passed_properly",
        });
        expect(res.json).toHaveBeenCalled();
    });

    describe("revoke token returns 'token revoked' when inputs are proper", () => {
        test("works with .token", async () => {
            // setup
            authService.revokeToken = jest.fn();
            const req: Request = { body: {} } as Request;
            req.body.token = "aaaaaaaaa";
            req.ip = "195.1.1.3";
            req.user = { role: "User", acctId: 300 };
            const res: Response = mockResponse();
            const n: NextFunction = {} as NextFunction;
            // ready
            const response = await controller.revokeToken(req, res, n);
            expect(authService.revokeToken).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: "Token revoked" });
        });
        test("works with .refreshToken", async () => {
            // setup
            authService.revokeToken = jest.fn();
            const req: Request = { body: {}, cookies: { refreshToken: "" } } as Request;
            req.cookies.refreshToken = "bbbbbb";
            req.ip = "195.1.1.3";
            req.user = { role: "User", acctId: 303 };
            const res: Response = mockResponse();
            const n: NextFunction = {} as NextFunction;
            // ready
            const response = await controller.revokeToken(req, res, n);
            expect(authService.revokeToken).toHaveBeenCalled();
            expect(response.json).toHaveBeenCalledWith({ message: "Token revoked" });
        });
    });

    describe("revoke token fails the way I expect", () => {
        test("kicks you out when user is undefined", async () => {
            // setup
            authService.revokeToken = jest.fn();
            const req: Request = { body: {}, cookies: { refreshToken: "" } } as Request;
            req.user = undefined;
            const res: Response = mockResponse();
            const n: NextFunction = {} as NextFunction;
            // ready
            const response = await controller.revokeToken(req, res, n);
            expect(response.json).toHaveBeenCalledWith({ error: "User is required" });
            expect(authService.revokeToken).not.toHaveBeenCalled();
        });
        test("says 'token is required' when there is none", async () => {
            // setup
            authService.revokeToken = jest.fn();
            const req: Request = { body: {}, cookies: { refreshToken: "" } } as Request;
            req.user = { role: "User", acctId: 305 };
            const res: Response = mockResponse();
            const n: NextFunction = {} as NextFunction;
            // ready
            const response = await controller.revokeToken(req, res, n);
            expect(response.json).toHaveBeenCalledWith({ error: "Token is required" });
            expect(authService.revokeToken).not.toHaveBeenCalled();
        });
    });
});
