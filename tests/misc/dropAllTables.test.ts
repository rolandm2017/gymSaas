import CityDAO from "../../src/database/dao/city.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import { CityCreationAttributes } from "../../src/database/models/City";
import { TaskCreationAttributes } from "../../src/database/models/Task";
import { ProviderEnum } from "../../src/enum/provider.enum";

import { app } from "../mocks/mockServer";

process.on("unhandledRejection", reason => {
    console.log(reason); // log the reason including the stack trace
});

let cityDAO: CityDAO = new CityDAO();
let taskDAO: TaskDAO = new TaskDAO();

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("city");
    // await app.dropAllTables(); // takes too long
});

afterAll(async () => {
    await app.closeDB();
});

describe("we see if drop all tables really drops all tables", () => {
    let cityId = 0;
    test("spam cities", async () => {
        const cityPayload: CityCreationAttributes = {
            cityName: "montrealAAAA2",
            country: "canada",
            centerLat: 50,
            centerLong: 50,
            scanRadius: 25,
            lastScan: null,
        };
        const initCity = await cityDAO.createCity(cityPayload);
        cityPayload.cityName = "t2123";
        let initCity2 = await cityDAO.createCity(cityPayload);
        cityPayload.cityName = "t3123";
        initCity2 = await cityDAO.createCity(cityPayload);
        cityPayload.cityName = "t4123";
        initCity2 = await cityDAO.createCity(cityPayload);
        cityPayload.cityName = "t5123";
        initCity2 = await cityDAO.createCity(cityPayload);
        if (initCity === undefined) fail("must be defined");
        expect(initCity.cityId).toBeDefined();
        console.log(initCity, "40rm");
        cityId = initCity.cityId;
    });
    test("spam tasks", async () => {
        const payload: TaskCreationAttributes = {
            providerName: ProviderEnum.rentFaster,
            lat: 50,
            long: 50,
            zoomWidth: 0,
            batch: 1,
            lastScan: null,
            cityId: cityId,
        };
        let t = await taskDAO.createTask(payload);
        t = await taskDAO.createTask(payload);
        t = await taskDAO.createTask(payload);
        t = await taskDAO.createTask(payload);
        t = await taskDAO.createTask(payload);
        if (t == undefined) fail("undefined task");
        expect(t.batch).toBe(1);
    });
});
