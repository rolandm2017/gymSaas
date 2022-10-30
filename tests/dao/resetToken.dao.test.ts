import ResetTokenDAO from "../../src/database/dao/resetToken.dao";
import AccountDAO from "../../src/database/dao/account.dao";
import { ResetToken } from "../../src/database/models/ResetToken";
import { app } from "../mocks/mockServer";

import { FAKE_ACCOUNT } from "../mocks/userCredentials";

let acctDAO: AccountDAO = new AccountDAO();
let resetTokenDAO: ResetTokenDAO = new ResetTokenDAO(acctDAO);

let newAcct;

beforeAll(async () => {
    await app.connectDB();
    const newAcctDetails = {
        email: "kim@gmail.com",
        passwordHash: "afsdoifsaofj",
        isVerified: true,
        verificationToken: "",
        updated: 100,
        role: "User",
        passwordReset: 0,
    };
    newAcct = await acctDAO.createAccount(newAcctDetails);
    const now = new Date();
    await resetTokenDAO.createResetToken(newAcct.acctId, "someTokenString", now);
});

beforeEach(async () => {
    await app.dropTable("resetToken");
});

afterAll(async () => {
    await app.closeDB();
});

describe("reset token DAO tests", () => {
    test("create one", async () => {
        const freshAcctDetails = {
            email: "sally@gmail.com",
            passwordHash: "afsdoifsaofj3adsfads",
            isVerified: true,
            verificationToken: "",
            updated: 1002,
            role: "User",
            passwordReset: 110,
        };
    });
    test("i see 0 accounts in the db when it is freshly started", async () => {
        //
    });
});
