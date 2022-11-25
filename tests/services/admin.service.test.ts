import AccountDAO from "../../src/database/dao/account.dao";
import AdminService from "../../src/service/admin.service";

import { app } from "../mocks/mockServer";

let adminService: AdminService;
let acctDAO: AccountDAO;

beforeAll(async () => {
    await app.connectDB();
    // await app.dropTable("account");

    acctDAO = new AccountDAO(); // reset to a fresh AcctDAO before every test.
    adminService = new AdminService(acctDAO);
});

afterAll(async () => {
    await app.closeDB();
});

describe("test admin service on its own", () => {
    // todo: this is low priority. Would rather write integration tests for the admin controller
});
