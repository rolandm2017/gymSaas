import AccountDAO from "../../src/database/dao/account.dao";
import { IAccount } from "../../src/interface/Account.interface";
import EmailService from "../../src/service/email.service";
import { emails } from "../mocks/userCredentials";

let emailService: EmailService;

beforeAll(async () => {
    const TEST_MODE = "testing";
    const acctDAO = new AccountDAO();
    emailService = new EmailService(acctDAO, TEST_MODE);
    emailService.emailSenderReached = jest.fn();
});

beforeEach(() => {
    jest.clearAllMocks();
});

const fakeOrigin: string = "https://www.google.ca";

describe("email service test", () => {
    describe("happy path for emails", () => {
        test("sendVerificationEmail", async () => {
            // todo: replace with a generated verif token using the algo
            const testAccount: IAccount = { verificationToken: "asdfdsfTEST", email: "captainPlaceholder@gmail.com" } as IAccount;

            await emailService.sendVerificationEmail(testAccount, fakeOrigin);
            expect(emailService.emailSenderReached).toHaveBeenCalled();
        });
        test("sendAlreadyRegisteredEmail", async () => {
            //
            await emailService.sendAlreadyRegisteredEmail("captainPlaceholder9000@gmail.com", fakeOrigin);
            expect(emailService.emailSenderReached).toHaveBeenCalled();
        });
        test("sendPasswordResetEmail", async () => {
            const testAccount: IAccount = { resetToken: { token: "there is a token!" }, email: "captainPlaceholder@gmail.com" } as IAccount;

            await emailService.sendPasswordResetEmail(testAccount, fakeOrigin);
            expect(emailService.emailSenderReached).toHaveBeenCalled();
        });
    });
    describe("sad paths + trying to break it", () => {
        test("no origin specified", async () => {
            // **
            // they are commented out if TS blocked them from entering the func
            // **
            const badOrigin1 = "";
            // const badOrigin2 = 0;
            // const badOrigin3 = undefined;
            // const badOrigin4 = [];
            // const badOrigin5 = NaN;
            // const badOrigin6 = {};

            const testAccount: IAccount = { verificationToken: "asdfdsfTEST", email: "captainPlaceholder@gmail.com" } as IAccount;
            await emailService.sendVerificationEmail(testAccount, badOrigin1);
        });
        test("no verification token on the one that needs one", async () => {
            const testAccount: IAccount = { verificationToken: "", email: "captainPlaceholder@gmail.com" } as IAccount;

            await expect(emailService.sendVerificationEmail(testAccount, fakeOrigin)).rejects.toThrow("Verification token missing");
        });
        test("no reset token on the one that needs one", async () => {
            const testAccount: IAccount = { resetToken: { token: "" }, email: "captainPlaceholder@gmail.com" } as IAccount;

            await expect(emailService.sendPasswordResetEmail(testAccount, fakeOrigin)).rejects.toThrow("Reset token missing");
        });
    });
});
