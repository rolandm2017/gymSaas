import { IAccount } from "../../src/interface/Account.interface";
import EmailService from "../../src/service/email.service";
import { emails } from "../mocks/userCredentials";

let emailService: EmailService;

beforeAll(async () => {
    const TEST_MODE = "testing";
    emailService = new EmailService(TEST_MODE);
    emailService.emailSenderReached = jest.fn();
});

beforeEach(() => {
    jest.clearAllMocks();
});

const fakeOrigin: string = "https://www.google.ca";

describe("email service test", () => {
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
