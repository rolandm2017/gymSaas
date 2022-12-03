import ResetTokenDAO from "../../src/database/dao/resetToken.dao";
import AccountDAO from "../../src/database/dao/account.dao";

import { app } from "../mocks/mockServer";

let acctDAO: AccountDAO = new AccountDAO();
let resetTokenDAO: ResetTokenDAO = new ResetTokenDAO(acctDAO);

let newAcct;

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("resetToken");
    // await app.dropAllTables(); // takes too long
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

beforeEach(async () => {});

afterAll(async () => {
    await app.closeDB();
});

describe("reset token DAO tests", () => {
    test("reset token dao returns null if there is no batches", async () => {
        const definitelyNull = await resetTokenDAO.getAllResetTokens();
        expect(definitelyNull.length).toBe(1); // 1 because something is added in beforeAll()
    });
    test("create one", async () => {
        // todo
        const freshAcctDetails = {
            email: "sally@gmail.com",
            passwordHash: "afsdoifsaofj3adsfads",
            isVerified: true,
            verificationToken: "",
            updated: 1002,
            role: "User",
            passwordReset: 110,
        };
        const newAcct = await acctDAO.createAccount(freshAcctDetails);
        const newResetToken = await resetTokenDAO.createResetToken(newAcct.acctId, "someOtherTokenString", new Date());
        expect(newResetToken.token).toBeDefined();
        expect(newResetToken.acctId).toBe(newAcct.acctId);
    });
});
