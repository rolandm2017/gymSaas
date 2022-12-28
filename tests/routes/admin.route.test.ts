import request from "supertest";
//
import { HealthCheck } from "../../src/enum/healthCheck.enum";

import { adminCredentials } from "../mocks/adminCredentials";
import { ProviderEnum } from "../../src/enum/provider.enum";
import { CityNameEnum } from "../../src/enum/cityName.enum";

import CityDAO from "../../src/database/dao/city.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import StateDAO from "../../src/database/dao/state.dao";
import { testTasks } from "../mocks/testTasks";
import { smlCanada } from "../mocks/smallRealResults/smlCanada";
import { smlFaster } from "../mocks/smallRealResults/smlFaster";
import { smlSeeker } from "../mocks/smallRealResults/smlSeeker";
import { app, server } from "../mocks/mockServer";
import BatchDAO from "../../src/database/dao/batch.dao";

let adminJWT: string = "";

const firstBatch = 0;
const secondBatch = 1;
const thirdBatch = 2;

const miniPayloadRentCanada = {
    provider: ProviderEnum.rentCanada,
    cityName: CityNameEnum.montreal,
    coords: testTasks[0],
    zoomWidth: 10,
    batchNum: firstBatch,
};
const miniPayloadRentFaster = {
    provider: ProviderEnum.rentFaster,
    cityName: CityNameEnum.montreal,
    coords: testTasks[1],
    zoomWidth: 10,
    batchNum: secondBatch,
};
const miniPayloadRentSeeker = {
    provider: ProviderEnum.rentSeeker,
    cityName: CityNameEnum.montreal,
    coords: testTasks[2],
    zoomWidth: 10,
    batchNum: thirdBatch,
};

const stateDAO = new StateDAO();
const cityDAO = new CityDAO();
const taskDAO = new TaskDAO();
const housingDAO = new HousingDAO(stateDAO, cityDAO);

let targetCityId: number | undefined = undefined;
let findingsPayload1: any;
let findingsPayload2: any;
let findingsPayload3: any;

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("task");
    await app.dropTable("batch");
    const loginResponse = await request(server).post("/auth/authenticate").send(adminCredentials);
    adminJWT = loginResponse.body.jwtToken;
    console.log(adminJWT, " admin JWT");
    // create batch nums to be used
    const batchDAO = new BatchDAO();
    // batch num is initially 0
    // create tasks for this batch number
    const tasks = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
    expect(tasks.body.queued.pass).toEqual(miniPayloadRentCanada.coords.length);
    // increment batch number
    // create tasks for this batch number
    const tasks2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
    expect(tasks2.body.queued.pass).toEqual(miniPayloadRentFaster.coords.length);
    // increment batch number
    // create tasks for this batch number
    const tasks3 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentSeeker);
    expect(tasks3.body.queued.pass).toEqual(miniPayloadRentSeeker.coords.length);
    const allTasks = await taskDAO.getAllTasks();
    expect(allTasks.length).toEqual(testTasks.flat().length);
    console.log(allTasks.length, testTasks.flat().length, "tasks in db");
    //
    // create some apartments so there are some to find
    //

    // get city id for mtl so we can use it in the cityId so we can find cities by searching for "Montreal" later
    const mtl = await cityDAO.getCityByName(CityNameEnum.montreal);

    findingsPayload1 = {
        provider: ProviderEnum.rentCanada,
        taskId: 1,
        apartments: smlCanada.results,
        cityId: mtl?.cityId,
        batchNum: firstBatch,
    };
    targetCityId = mtl?.cityId;

    await request(server).post("/task_queue/report_findings_and_mark_complete").send(findingsPayload1);
    findingsPayload2 = { provider: ProviderEnum.rentFaster, taskId: 2, apartments: smlFaster.results, cityId: mtl?.cityId, batchNum: secondBatch };
    await request(server).post("/task_queue/report_findings_and_mark_complete").send(findingsPayload2);
    findingsPayload3 = {
        provider: ProviderEnum.rentSeeker,
        taskId: 3,
        apartments: smlSeeker.results,
        cityId: mtl?.cityId,
        batchNum: thirdBatch,
    };
    await request(server).post("/task_queue/report_findings_and_mark_complete").send(findingsPayload3);
    const allHousing = await housingDAO.getAllHousing();
    expect(allHousing.length).toEqual([smlCanada.results.listings, smlFaster.results.listings, smlSeeker.results.hits].flat().length);
});

afterAll(async () => {
    await app.closeDB();
});

describe("Test admin controller with supertest", () => {
    describe("controller works with proper credentials", () => {
        test("Health check responds", async () => {
            const response = await request(server).get("/admin" + HealthCheck.healthCheck);
            expect(response.body.message).toBe("active");
        });
        test("Get all batch numbers", async () => {
            const response = await request(server)
                .get("/admin/batches/all")
                .set("Authorization", "Bearer " + adminJWT);
            expect(response.body.batchNums.length).toBe(3); // because batchNums 0, 1 and 2 were used
        });
        test("Get all tasks", async () => {
            const response = await request(server)
                .get("/admin/task_queue/all")
                .set("Authorization", "Bearer " + adminJWT);
            expect(response.body.tasks.length).toBe(testTasks.flat().length);
        });
        test("Get housing by location", async () => {
            const cityName = "Montreal";
            // const stateName = "Quebec"; // i dont think it matters
            const response = await request(server)
                .get(`/admin/housing/by_location?cityName=${cityName}`)
                .set("Authorization", "Bearer " + adminJWT);
            expect(response.body.apartments.length).toBe(
                [smlCanada.results.listings, smlFaster.results.listings, smlSeeker.results.hits].flat().length,
            );
        });
        test("Get housing by city id and batch num", async () => {
            let cityId = findingsPayload2.cityId;
            let batchNum = findingsPayload2.batchNum;
            const response = await request(server)
                .get(`/admin/housing/by_city_id_and_batch_num?cityId=${cityId}&batchNum=${batchNum}`)
                .set("Authorization", "Bearer " + adminJWT);
            expect(response.body.apartments.length).toBe(findingsPayload2.apartments.listings.length); // used in payload findingsPayload2
            cityId = findingsPayload3.cityId; // is the same as before
            batchNum = findingsPayload3.batchNum;
            const response2 = await request(server)
                .get(`/admin/housing/by_city_id_and_batch_num?cityId=${cityId}&batchNum=${batchNum}`)
                .set("Authorization", "Bearer " + adminJWT);
            expect(response2.body.apartments.length).toBe(findingsPayload3.apartments.hits.length); // used in payload findingsPayload3
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
