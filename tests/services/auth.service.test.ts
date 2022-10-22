import { cookie } from "express-validator";
import request from "supertest";
import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";
import { IAccount } from "../../src/interface/Account.interface";
import { IBasicDetails } from "../../src/interface/BasicDetails.interface";
import { ISmallError } from "../../src/interface/SmallError.interface";
import AuthService from "../../src/service/auth.service";
import EmailService from "../../src/service/email.service";
import AccountUtil from "../../src/util/accountUtil";

// import { server } from "../mocks/server";
import { app } from "../mocks/mockServer";

import { emails, passwords, badPasswords, tooShortPassword } from "../mocks/userCredentials";

const validCredentials = {
    email: emails[0],
    password: passwords[0],
    confirmPassword: passwords[0],
    acceptTerms: true,
};

const validIPAddress = "143.14.14.143";

const JWT_TOKEN_LENGTH = 40; // todo: add real length of jwt
const REFRESH_TOKEN_LENGTH = 40; // todo: get real length
const someOrigin = "whatever";

let authService: AuthService;
let acctDAO: AccountDAO;
let resetTokenDAO: ResetTokenDAO;
let emailService: EmailService;
let accountUtil: AccountUtil;

beforeAll(async () => {
    await app.connectDB();
    // lots of setup
    acctDAO = new AccountDAO();
    // acctDAO.getAccountByEmail = jest.fn().mockReturnValue(expectedAccount);
    acctDAO.createAccount = jest.fn();
    acctDAO.getMultipleAccounts = jest.fn();
    acctDAO.getAccountByRefreshToken = jest.fn();
    acctDAO.getAccountByVerificationToken = jest.fn();
    acctDAO.getAccountById = jest.fn();
    resetTokenDAO = new ResetTokenDAO();
    resetTokenDAO.createResetToken = jest.fn();
    emailService = new EmailService(acctDAO);
    emailService.sendAlreadyRegisteredEmail = jest.fn();
    emailService.sendPasswordResetEmail = jest.fn();
    emailService.sendVerificationEmail = jest.fn();
    accountUtil = new AccountUtil();
    authService = new AuthService(emailService, accountUtil, acctDAO, resetTokenDAO);
    console.log("Creating account with credentials:", validCredentials);
    await authService.register(validCredentials, someOrigin); // so there's always an acct to check up on in the db
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe("test auth service on its own", () => {
    describe("sign up, log in", () => {
        //
        test("you can log in with an account", async () => {
            // todo: beforeAll an account into the db so this test ISNT dependent on another test creating an account to auth as.
            const account: IBasicDetails | ISmallError = await authService.authenticate(
                validCredentials.email,
                validCredentials.password,
                validIPAddress,
            );
            if ("email" in account) {
                expect(account.email).toEqual(validCredentials.email);
                expect(account.jwtToken).toBeDefined();
                expect(account.jwtToken!.length).toEqual(JWT_TOKEN_LENGTH);
                expect(account.refreshToken).toBeDefined();
                expect(account.refreshToken!.length).toEqual(REFRESH_TOKEN_LENGTH);
            } else {
                throw new Error("failed test");
            }
        });
        test("you can register an account", async () => {
            //fixme: use 2nd valid credentails
            const registered: IBasicDetails | ISmallError = await authService.register(validCredentials, someOrigin);
            console.log(registered);
            if ("email" in registered) {
                expect(registered.email).toEqual(validCredentials.email);
                expect(registered.jwtToken).toBeDefined();
                expect(registered.jwtToken!.length).toEqual(JWT_TOKEN_LENGTH);
                expect(registered.refreshToken).toBeDefined();
                expect(registered.refreshToken!.length).toEqual(REFRESH_TOKEN_LENGTH);
            } else {
                throw new Error("failed test");
            }
        });
    });

    // no test for .refreshToken or .revokeToken because they depend on too many things.
    // todo: test those^^

    describe("password reset flow works, minus the email part that we won't test", () => {
        test("password reset flow with expected inputs", async () => {
            //
            const goodEmail = validCredentials.email;
            const goodOrigin = "https://www.google.ca";
            await authService.forgotPassword(goodEmail, goodOrigin);
            expect(acctDAO.getAccountByEmail).toHaveBeenCalledWith(goodEmail);
            expect(resetTokenDAO.createResetToken).toHaveBeenCalled();
            expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith();
        });
        test("password reset flow with zero returned accounts for an email error out", async () => {
            const emailThatsInTheDBZeroTimes = "aTestEmail@gmail.com";
            const goodOrigin = "https://www.google.ca";
            acctDAO.getAccountByEmail = jest.fn().mockReturnValueOnce([]);
            accountUtil.randomTokenString = jest.fn();
            await authService.forgotPassword(emailThatsInTheDBZeroTimes, goodOrigin);
            expect(accountUtil.randomTokenString).not.toHaveBeenCalled();
        });
    });
});
