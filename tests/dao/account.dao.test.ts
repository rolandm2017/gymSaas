import AccountDAO from "../../src/database/dao/account.dao";
import { Account } from "../../src/database/models/Account";
import { app } from "../mocks/mockServer";

import { FAKE_ACCOUNT } from "../mocks/userCredentials";

let activeAcctDAO: AccountDAO = new AccountDAO();

beforeAll(async () => {
    await app.connectDB();
    await app.dropAllTables();
    await app.dropTable("account");
});

afterAll(async () => {
    await app.closeDB();
});

describe("account DAO tests", () => {
    test("I can create an account and then find it in the db", async () => {
        const created: Account = await activeAcctDAO.createAccount(FAKE_ACCOUNT);
        expect(created).toBeDefined();
        expect(created.email).toBe(FAKE_ACCOUNT.email);
        expect(created.id).toBe(FAKE_ACCOUNT.id);
        // now get the account
        const retrieved: Account[] = await activeAcctDAO.getAccountByEmail(FAKE_ACCOUNT.email);
        expect(retrieved).toBeDefined();
        expect(retrieved.length).toEqual(1);
        expect(retrieved[0].id).toEqual(FAKE_ACCOUNT.id);
        expect(retrieved[0].email).toEqual(FAKE_ACCOUNT.email);
    });

    test("the createAccount fails if given invalid inputs - this is good", async () => {
        //
        const f = { ...FAKE_ACCOUNT };
        f.email = "notAnEmail";
        await expect(async () => {
            await activeAcctDAO.createAccount(f);
        }).rejects.toThrow("Email field wasn't an email");
        const g = { ...FAKE_ACCOUNT };
        g.email = "alsoNotEmail@gmail"; // missing .com
        await expect(async () => {
            await activeAcctDAO.createAccount(g);
        }).rejects.toThrow("Email field wasn't an email");
    });
});
