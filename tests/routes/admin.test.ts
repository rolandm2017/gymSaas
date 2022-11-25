import request from "supertest";
import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";

import { app, server } from "../mocks/mockServer";

beforeAll(async () => {
    await app.connectDB();

    // await app.dropAllTables(); // takes too long
});

afterAll(async () => {
    await app.closeDB();
});

describe("Test admin controller with supertest", () => {
    test("Health check responds", async () => {
        const response = await request(server).get("/admin/health_check");
        console.log(response.body, "20rm");
        expect(response.body.message).toBe("active");
    });
    test("Get all batch numbers", async () => {
        //
    });
    test("Get all tasks", async () => {
        //
    });
    test("Get housing by location", async () => {
        //
    });
    test("Get housing by city id and batch num", async () => {
        //
    });
    test("Ban a user", async () => {
        //
    });
    test("Make a user admin", async () => {
        // todo
    });
});
