import CityDAO from "../../src/database/dao/city.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import { CityCreationAttributes } from "../../src/database/models/City";
import { TaskCreationAttributes } from "../../src/database/models/Task";
import { ProviderEnum } from "../../src/enum/provider.enum";
import { app } from "../mocks/mockServer";

let cityDAO: CityDAO = new CityDAO();
let taskDAO: TaskDAO = new TaskDAO();

beforeAll(async () => {
    await app.connectDB();
    // await app.dropTable("city");
    await app.dropAllTables();
});

beforeEach(async () => {
    await app.dropTable("task");
});

afterAll(async () => {
    await app.closeDB();
});

describe("confirm task DAO works as expected", () => {
    test("we can insert 3 different batches of tasks and then get the batch num", async () => {
        // setup so that city with cityId exists
        const cityPayload: CityCreationAttributes = {
            cityName: "montreal2222",
            country: "canada",
            centerLat: 50,
            centerLong: 50,
            scanRadius: 25,
            lastScan: null,
        };
        const initCity = await cityDAO.createCity(cityPayload);
        if (initCity === undefined) fail("initCity must be defined");
        expect(initCity.cityId).toBeDefined();
        // 1
        const payload: TaskCreationAttributes = {
            providerName: ProviderEnum.rentCanada,
            lat: 50,
            long: 50,
            zoomWidth: 0,
            batchId: 1,
            lastScan: null,
            cityId: initCity.cityId,
        };
        let t = await taskDAO.createTask(payload);
        if (t === undefined) fail("t should be defined here");
        expect(t.batchId).toBe(1);
        let highestBatch = await taskDAO.getHighestBatchNum();
        if (highestBatch === null) throw new Error("expected batch does not exist");
        // 2
        payload.batchId = highestBatch.batchId + 1;
        let t2 = await taskDAO.createTask(payload);
        highestBatch = await taskDAO.getHighestBatchNum();
        if (highestBatch === null) throw new Error("expected batch does not exist");
        // 3
        payload.batchId = highestBatch.batchId + 1;
        let t3 = await taskDAO.createTask(payload);
        highestBatch = await taskDAO.getHighestBatchNum();
        if (highestBatch === null) throw new Error("expected batch does not exist");
        // try now
        highestBatch = await taskDAO.getHighestBatchNum();
        expect(highestBatch?.batchId).toBe(3);
        expect(true).toBe(true);
    });
});
