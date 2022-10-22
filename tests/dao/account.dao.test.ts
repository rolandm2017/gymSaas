import AccountDAO from "../../src/database/dao/account.dao";
import { Account } from "../../src/database/models/Account";

import { FAKE_ACCOUNT } from "../mocks/userCredentials";

let activeAcctDAO: AccountDAO = new AccountDAO();

beforeAll(() => {
    // todo: initialize server
});

describe("account DAO tests", () => {
    test("I can create an account and then find it in the db", async () => {
        const created: Account = await activeAcctDAO.createAccount(FAKE_ACCOUNT);
        const retrieved: Account[] = await activeAcctDAO.getAccountByEmail(FAKE_ACCOUNT.email);
        expect(retrieved).toBeDefined();
        expect(retrieved.length).toEqual(1);
        expect(retrieved[0].id).toEqual(FAKE_ACCOUNT.id);
    });
});
