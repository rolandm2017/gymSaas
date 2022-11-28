import request from "supertest";
//
import { HealthCheck } from "../../src/enum/routes/healthCheck.enum";
import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";

import { app, server } from "../mocks/mockServer";
import { adminCredentials } from "../mocks/adminCredentials";
import { ProviderEnum } from "../../src/enum/provider.enum";
import { CityEnum } from "../../src/enum/city.enum";
import { testTasks } from "../mocks/testTasks";

let adminJWT: string = "";

const miniPayloadRentCanada = {
    provider: ProviderEnum.rentCanada,
    city: CityEnum.montreal,
    coords: testTasks[0],
    zoomWidth: 10,
    batchNum: 0,
};
const miniPayloadRentFaster = {
    provider: ProviderEnum.rentFaster,
    city: CityEnum.montreal,
    coords: testTasks[1],
    zoomWidth: 10,
    batchNum: 1,
};
const miniPayloadRentSeeker = {
    provider: ProviderEnum.rentSeeker,
    city: CityEnum.montreal,
    coords: testTasks[2],
    zoomWidth: 10,
    batchNum: 2,
};

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("task");
    await app.dropTable("batch");
    const loginResponse = await request(server).post("/auth/authenticate").send(adminCredentials);
    adminJWT = loginResponse.body.jwtToken;
    console.log(adminJWT, " admin JWT");
    // batch num is initially 0
    // create tasks for this batch number
    const tasks = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
    // increment batch number
    // create tasks for this batch number
    const tasks2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
    // increment batch number
    // create tasks for this batch number
    const tasks3 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentSeeker);
});

afterAll(async () => {
    await app.closeDB();
});

describe("Test admin controller with supertest", () => {
    describe("controller works with proper credentials", () => {
        test("Health check responds", async () => {
            const response = await request(server).get("/admin" + HealthCheck.healthCheck);
            console.log(response.body, "20rm");
            expect(response.body.message).toBe("active");
        });
        test("Get all batch numbers", async () => {
            const response = await request(server)
                .get("/admin/batches/all")
                .set("Authorization", "Bearer " + adminJWT);
            console.log(response.body.batchNums, "56rm");
            expect(response.body.batchNums.length).toBe(3); // because batchNums 0, 1 and 2 were used
        });
        test("Get all tasks", async () => {
            const response = await request(server)
                .get("/admin/task_queue/all")
                .set("Authorization", "Bearer " + adminJWT);
            expect(response.body.tasks.length).toBe(testTasks.flat().length);
        });
        test("Get housing by location", async () => {
            const cityName = "Vancouver";
            const stateName = "British Columbia";
            const response = await request(server)
                .get(`/admin/batches/all?cityName=${cityName}&stateName=${stateName}`)
                .set("Authorization", "Bearer " + adminJWT);
            console.log(response.body.apartments, "69rm");
        });
        test("Get housing by city id and batch num", async () => {
            const cityId = 1;
            const batchNum = 1;
            const response = await request(server)
                .get(`/admin/batches/all?cityId=${cityId}&batchNum=${batchNum}`)
                .set("Authorization", "Bearer " + adminJWT);
            console.log(response.body.apartments, "69rm");
        });
        test("Ban a user", async () => {
            //
        });
        test("Make a user admin", async () => {
            // todo
        });
    });
    describe("we can't bypass admin authorization", () => {
        test("undefined jwt payload", async () => {
            //
            const response = await request(server).get("/admin/task_queue/all");
            // .set("Authorization", "bearer " + ""); // undefined!
            expect(response.body.message).toBe("Unauthorized");
        });
        test("empty string jwt payload", async () => {
            //
            const response = await request(server)
                .get("/admin/task_queue/all")
                .set("Authorization", "bearer " + "");
            expect(response.body.message).toBe("Unauthorized");
        });
        test("unexpected inputs jwt payload", async () => {
            //
            const response = await request(server)
                .get("/admin/task_queue/all")
                .set("Authorization", "bearer " + "$#$#$#$#$@$#))(");
            expect(response.body.message).toBe("Unauthorized");
        });
    });
});
