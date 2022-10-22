import AccountDAO from "../../src/database/dao/account.dao";
import { Account } from "../../src/database/models/Account";
import { app } from "../mocks/server";

import { FAKE_ACCOUNT } from "../mocks/userCredentials";

let activeAcctDAO: AccountDAO = new AccountDAO();

beforeAll(async () => {
    // todo: initialize server
    await app.connectDB();
});

afterAll(async () => {
    await app.closeDB();
});

describe("account DAO tests", () => {
    test("I can create an account and then find it in the db", async () => {
        console.log(FAKE_ACCOUNT.email, "20rm");
        const created: Account = await activeAcctDAO.createAccount(FAKE_ACCOUNT);
        console.log(created, "22rm");
        expect(created).toBeDefined();
        const retrieved: Account[] = await activeAcctDAO.getAccountByEmail(FAKE_ACCOUNT.email);
        console.log(retrieved, "22rm");
        expect(retrieved).toBeDefined();
        expect(retrieved.length).toEqual(1);
        expect(retrieved[0].id).toEqual(FAKE_ACCOUNT.id);
        expect(retrieved[0].email).toEqual(FAKE_ACCOUNT.email);
    });
    test("the createAccount fails if given invalid inputs - this is good", async () => {
        //
        const f = { ...FAKE_ACCOUNT };
        f.email = "notAnEmail";
        // const created: Account = await activeAcctDAO.createAccount(f);
        await expect(async () => {
            await activeAcctDAO.createAccount(f);
        }).rejects.toThrow("Email field wasn't an email");
        // expect(created).toBeUndefined();
        const g = { ...FAKE_ACCOUNT };
        g.email = "alsoNotEmail@gmail"; // missing .com
        await expect(async () => {
            activeAcctDAO.createAccount(g);
        }).rejects.toThrow("Email field wasn't an email");
        // const created2: Account = await activeAcctDAO.createAccount(g);
        // expect(created2).toBeUndefined();
    });
});
