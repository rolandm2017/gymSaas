import request from "supertest";
//
import { HealthCheck } from "../../src/enum/routes/healthCheck.enum";
import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";

import { app, server } from "../mocks/mockServer";
import { adminCredentials } from "../mocks/adminCredentials";

let adminJWT: string = "";

beforeAll(async () => {
    await app.connectDB();
    const loginResponse = await request(server).post("/auth/authenticate").send(adminCredentials);
    adminJWT = loginResponse.body.jwtToken;
    // increment batch number
    // create 3 tasks for this batch number
    // increment batch number
    // create 4 tasks for this batch number
    // increment batch number
    // create 2 tasks for this batch number
});

afterAll(async () => {
    await app.closeDB();
});

describe("Test admin controller with supertest", () => {
    describe("we can't bypass admin authorization", () => {
        test("undefined jwt payload", async () => {
            //
            const response = await request(server).get("/admin/batches/all");
            // .set("Authorization", "bearer " + ""); // undefined!
            expect(response.body.message).toBe("Unauthorized");
        });
        test("empty string jwt payload", async () => {
            //
            const response = await request(server)
                .get("/admin/batches/all")
                .set("Authorization", "bearer " + "");
            expect(response.body.message).toBe("Unauthorized");
        });
        test("unexpected inputs jwt payload", async () => {
            //
            const response = await request(server)
                .get("/admin/batches/all")
                .set("Authorization", "bearer " + "$#$#$#$#$@$#))(");
            expect(response.body.message).toBe("Unauthorized");
        });
    });
    describe("controller works with proper credentials", () => {
        test("Health check responds", async () => {
            const response = await request(server).get("/admin" + HealthCheck.healthCheck);
            console.log(response.body, "20rm");
            expect(response.body.message).toBe("active");
        });
        test("Get all batch numbers", async () => {
            const response = await request(server)
                .get("/admin/batches/all")
                .set("Authorization", "bearer " + adminJWT);
            console.log(response.body.batchNums, "56rm");
            expect(response.body.batchNums.length).toBeGreaterThan(0);
        });
        test("Get all tasks", async () => {
            const response = await request(server)
                .get("/admin/task_queue/all")
                .set("Authorization", "bearer " + adminJWT);
            console.log(response.body.tasks, "63rm");
        });
        test("Get housing by location", async () => {
            const cityName = "Vancouver";
            const stateName = "British Columbia";
            const response = await request(server)
                .get(`/admin/batches/all?cityName=${cityName}&stateName=${stateName}`)
                .set("Authorization", "bearer " + adminJWT);
            console.log(response.body.apartments, "69rm");
        });
        test("Get housing by city id and batch num", async () => {
            const cityId = 1;
            const batchNum = 1;
            const response = await request(server)
                .get(`/admin/batches/all?cityId=${cityId}&batchNum=${batchNum}`)
                .set("Authorization", "bearer " + adminJWT);
            console.log(response.body.apartments, "69rm");
        });
        test("Ban a user", async () => {
            //
        });
        test("Make a user admin", async () => {
            // todo
        });
    });
});
