import { cookie } from "express-validator";
import request from "supertest";
import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";
import { Account } from "../../src/database/models/Account";
import { Role } from "../../src/enum/role.enum";
import { IAccount } from "../../src/interface/Account.interface";
import { IBasicDetails } from "../../src/interface/BasicDetails.interface";
import { IRegistrationDetails } from "../../src/interface/RegistrationDetails.interface";
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
    accountUtil = new AccountUtil();
    // const populatedAcct = await accountUtil.attachMissingDetails(validCredentials);
    // acctDAO.getAccountByEmail = jest.fn().mockReturnValue(expectedAccount);
    // acctDAO.createAccount = jest.fn().mockRejectedValueOnce(populatedAcct);
    // acctDAO.getMultipleAccounts = jest.fn().mockReturnValueOnce({ rows: [], count: 0 });
    // acctDAO.getAccountByRefreshToken = jest.fn();
    // acctDAO.getAccountByVerificationToken = jest.fn();
    // acctDAO.getAccountById = jest.fn();
    // console.log("52rm");
    // //
    resetTokenDAO = new ResetTokenDAO();
    // resetTokenDAO.createResetToken = jest.fn();
    // //
    acctDAO = new AccountDAO(); // reset to a fresh AcctDAO before every test.
    emailService = new EmailService(acctDAO);
    // emailService.sendAlreadyRegisteredEmail = jest.fn();
    // emailService.sendPasswordResetEmail = jest.fn();
    // emailService.sendVerificationEmail = jest.fn();
    // //
    // accountUtil.attachMissingDetails = jest.fn().mockReturnValueOnce(populatedAcct);
    // // make an acct in db
    authService = new AuthService(emailService, accountUtil, acctDAO, resetTokenDAO);
    console.log("Creating account with credentials:", validCredentials);
});

beforeEach(async () => {
    jest.clearAllMocks();
    await app.dropTable("account");
    acctDAO = new AccountDAO(); // reset to a fresh AcctDAO before every test.
    const c: IRegistrationDetails = validCredentials;
    await authService.register(c, someOrigin); // so there's always an acct to check up on in the db
    // todo: make this acct verified
});

afterAll(async () => {
    await app.closeDB();
});

// afterEach(async () => {
// await app.dropTable("account");
// });

describe("test auth service on its own", () => {
    describe("sign up, log in", () => {
        test("[authenticate] you can log in with an account", async () => {
            // **
            // ** good luck running a unit test on this method.
            // **
            // // todo: beforeAll an account into the db so this test ISNT dependent on another test creating an account to auth as.
            // // **
            // // setup: overwrite dependencies with mocks
            // // acctDAO.getAccountByEmail = jest.fn().mockReturnValueOnce({});
            // // accountUtil.convertAccountModelToInterface; // leave the way it is.
            // // accountUtil.generateJwtToken
            // // PRETEND its a verified account
            // // acctDAO.getAccountByEmail;
            // // const fakeAcctArr = await acctDAO.getAccountByEmail(validCredentials.email);
            // // const fakeAcct = fakeAcctArr[0];
            // // console.log(fakeAcct, "88rm");
            // // fakeAcct.isVerified = true;
            // acctDAO.getAccountByEmail = jest.fn().mockReturnValueOnce([
            //     {
            //         id: 41,
            //         email: "a@gmail.com",
            //         passwordHash: "$2b$10$bKkSoDfBKEoIWtoRzsruL.cR.YbJ1ncjriS0lkePlOE5FbYly1ITG",
            //         isVerified: true, // forged!
            //         verificationToken:
            //             "e32d5abf34b07c9870e624f6f6c1849cbb33a7535667605045f195230333d977625b868f8606d434",
            //         verified: 0,
            //         updated: 0,
            //         role: "USER",
            //         passwordReset: null,
            //     },
            // ]);
            // const authService2 = new AuthService(emailService, accountUtil, acctDAO, resetTokenDAO);
            // const account: IBasicDetails | ISmallError = await authService2.authenticate(
            //     validCredentials.email,
            //     validCredentials.password,
            //     validIPAddress,
            // );
            // expect(acctDAO.getAccountByEmail).toHaveBeenCalledWith(validCredentials.email);
            // if ("email" in account) {
            //     expect(account.email).toEqual(validCredentials.email);
            //     expect(account.jwtToken).toBeDefined();
            //     expect(account.jwtToken!.length).toEqual(JWT_TOKEN_LENGTH);
            //     expect(account.refreshToken).toBeDefined();
            //     expect(account.refreshToken!.length).toEqual(REFRESH_TOKEN_LENGTH);
            // } else {
            //     throw new Error("failed test");
            // }
        });
        test("[register] you can register an account", async () => {
            //fixme: use 2nd valid credentails
            const testAcct = { ...validCredentials };
            testAcct.email = "someOtherEmail2@gmail.com";
            const registered: IBasicDetails | ISmallError = await authService.register(testAcct, someOrigin);
            console.log(registered);
            if ("email" in registered) {
                expect(registered.email).toEqual(testAcct.email);
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
            acctDAO.getAccountByEmail = jest
                .fn()
                .mockReturnValueOnce([
                    { id: 9999999, resetToken: { token: "hats" }, role: Role.User, passwordHash: "someText99" },
                ]);
            resetTokenDAO.createResetToken = jest.fn();
            emailService.sendPasswordResetEmail = jest.fn();
            const authService2 = new AuthService(emailService, accountUtil, acctDAO, resetTokenDAO);
            const goodEmail = validCredentials.email;
            const goodOrigin = "https://www.google.ca";
            await authService2.forgotPassword(goodEmail, goodOrigin);
            expect(acctDAO.getAccountByEmail).toHaveBeenCalledWith(goodEmail);
            expect(resetTokenDAO.createResetToken).toHaveBeenCalled();
            expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
        });
        test("password reset flow with zero returned accounts for an email error out", async () => {
            // acctDAO.getAccountByEmail = jest.fn().mockReturnValue({ populatedAcct });
            const emailThatsInTheDBZeroTimes = "aTestEmail@gmail.com";
            const goodOrigin = "https://www.google.ca";
            acctDAO.getAccountByEmail = jest.fn().mockReturnValueOnce([]);
            accountUtil.randomTokenString = jest.fn();
            await authService.forgotPassword(emailThatsInTheDBZeroTimes, goodOrigin);
            expect(accountUtil.randomTokenString).not.toHaveBeenCalled();
        });
    });
});
