import AccountDAO from "../../src/database/dao/account.dao";
import { Account } from "../../src/database/models/Account";
// mock stuff
import { app } from "../mocks/mockServer";

import { FAKE_ACCOUNT } from "../mocks/userCredentials";

let activeAcctDAO: AccountDAO = new AccountDAO();

beforeAll(async () => {
    await app.connectDB();
    // await app.dropAllTables(); // takes too long
    await app.dropTable("account");
});

beforeEach(async () => {
    await app.dropTable("account");
});

afterAll(async () => {
    await app.closeDB();
});

describe("account DAO tests", () => {
    test("get multiple accounts returns 0 when there are none", async () => {
        const x = await activeAcctDAO.getMultipleAccounts(5);
        expect(x).toBeDefined();
        expect(x.count).toEqual(0);
        expect(x.rows.length).toEqual(0);
    });
    test("i see 0 accounts in the db when it is freshly started", async () => {
        const x = await activeAcctDAO.findAllAccounts();
        expect(x.length).toBe(0);
    });
    test("I can create an account and then find it in the db", async () => {
        const created: Account = await activeAcctDAO.createAccount(FAKE_ACCOUNT);

        expect(created).toBeDefined();
        expect(created.email).toBe(FAKE_ACCOUNT.email);
        expect(created.acctId).toBeDefined();
        // now get the account
        const retrieved: Account[] = await activeAcctDAO.getAccountByEmail(FAKE_ACCOUNT.email);
        expect(retrieved).toBeDefined();
        expect(retrieved.length).toEqual(1);
        // expect(retrieved[0].id).toEqual(FAKE_ACCOUNT.id);
        expect(retrieved[0].acctId).toBeDefined();
        expect(retrieved[0].email).toEqual(FAKE_ACCOUNT.email);
    });

    test("the createAccount fails if given invalid inputs - this is good", async () => {
        //
        const f = { ...FAKE_ACCOUNT };
        f.email = "notAnEmail";
        await expect(async () => {
            await activeAcctDAO.createAccount(f);
        }).rejects.toThrow("Email field wasn't an email");
        // 2nd
        const g = { ...FAKE_ACCOUNT };
        g.email = "alsoNotEmail@gmail"; // missing .com
        await expect(async () => {
            await activeAcctDAO.createAccount(g);
        }).rejects.toThrow("Email field wasn't an email");
    });

    test("get multiple accounts returns 2 when there are 2 accounts", async () => {
        // setup
        await activeAcctDAO.createAccount(FAKE_ACCOUNT);
        const FAKE2 = { ...FAKE_ACCOUNT };
        FAKE2.email = "aa" + FAKE_ACCOUNT.email;
        await activeAcctDAO.createAccount(FAKE2);
        const x = await activeAcctDAO.getMultipleAccounts(5);
        expect(x.count).toEqual(2);
        expect(x.rows.length).toEqual(2);
    });
});
