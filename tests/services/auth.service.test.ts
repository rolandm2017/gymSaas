import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";
import { Role } from "../../src/enum/role.enum";
import { IBasicDetails } from "../../src/interface/BasicDetails.interface";
import { IRegistrationDetails } from "../../src/interface/RegistrationDetails.interface";
import { ISmallError } from "../../src/interface/SmallError.interface";
import AuthService from "../../src/service/auth.service";
import EmailService from "../../src/service/email.service";
import AccountUtil from "../../src/util/accountUtil";
import sendEmail from "../../src/util/sendEmail";

import { app } from "../mocks/mockServer";

import { emails, passwords } from "../mocks/userCredentials";

const validCredentials = {
    email: emails[0],
    password: passwords[0],
    confirmPassword: passwords[0],
    acceptTerms: true,
};

const someOrigin = "whatever";

let authService: AuthService;
let acctDAO: AccountDAO;
let resetTokenDAO: ResetTokenDAO;
let emailService: EmailService;
let accountUtil: AccountUtil;

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("account");
    // lots of setup
    accountUtil = new AccountUtil();

    acctDAO = new AccountDAO(); // reset to a fresh AcctDAO before every test.
    resetTokenDAO = new ResetTokenDAO(acctDAO);
    // //
    emailService = new EmailService(sendEmail, "testing");
    // // make an acct in db
    authService = new AuthService(emailService, accountUtil, acctDAO, resetTokenDAO);
});

beforeEach(async () => {
    jest.clearAllMocks();
    await app.dropTable("account");
    acctDAO = new AccountDAO(); // reset to a fresh AcctDAO before every test.
    const c: IRegistrationDetails = validCredentials;
    await authService.register(c, someOrigin); // so there's always an acct to check up on in the db
});

afterAll(async () => {
    await app.closeDB();
});

describe("test auth service on its own", () => {
    describe("sign up, log in", () => {
        test("[register] you can register an account", async () => {
            const testAcct = { ...validCredentials };
            testAcct.email = "someOtherEmail2@gmail.com";
            const registered: IBasicDetails | ISmallError = await authService.register(testAcct, someOrigin);
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
                .mockReturnValueOnce([{ id: 9999999, resetToken: { token: "hats999" }, role: Role.User, passwordHash: "someText99" }]);
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
