import CityDAO from "../../src/database/dao/city.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import { CityCreationAttributes } from "../../src/database/models/City";
import { ProviderEnum } from "../../src/enum/provider.enum";
import { app } from "../mocks/mockServer";

let cityDAO: CityDAO = new CityDAO();
let taskDAO: TaskDAO = new TaskDAO();

beforeAll(async () => {
    await app.connectDB();
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
            city: "montreal",
            state: "quebec",
            country: "canada",
            centerLat: 50,
            centerLong: 50,
            scanRadius: 25,
            lastScan: undefined,
        };
        const initCity = await cityDAO.createCity(cityPayload);
        // 1
        const payload = {
            providerName: ProviderEnum.rentCanada,
            lat: 50,
            long: 50,
            zoomWidth: 0,
            batch: 1,
            lastScan: undefined,
            cityId: initCity.cityId,
        };
        let t = await taskDAO.createTask(payload);
        let highestBatch = await taskDAO.getHighestBatchNum();
        if (highestBatch === null) throw new Error("expected batch does not exist");
        // 2
        payload.batch = highestBatch.batch + 1;
        t = await taskDAO.createTask(payload);
        highestBatch = await taskDAO.getHighestBatchNum();
        if (highestBatch === null) throw new Error("expected batch does not exist");
        // 3
        payload.batch = highestBatch.batch + 1;
        t = await taskDAO.createTask(payload);
        highestBatch = await taskDAO.getHighestBatchNum();
        if (highestBatch === null) throw new Error("expected batch does not exist");
        // try now
        highestBatch = await taskDAO.getHighestBatchNum();
        expect(highestBatch?.batch).toBe(3);
        // expect(true).toBe(true);
    });
});
