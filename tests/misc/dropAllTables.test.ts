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
        try {
            const cityPayload: CityCreationAttributes = {
                city: "montrealAAAA2",
                state: "quebec",
                country: "canada",
                centerLat: 50,
                centerLong: 50,
                scanRadius: 25,
                lastScan: null,
            };
            const initCity = await cityDAO.createCity(cityPayload);
            cityPayload.city = "t2123";
            let initCity2 = await cityDAO.createCity(cityPayload);
            cityPayload.city = "t3123";
            initCity2 = await cityDAO.createCity(cityPayload);
            cityPayload.city = "t4123";
            initCity2 = await cityDAO.createCity(cityPayload);
            cityPayload.city = "t5123";
            initCity2 = await cityDAO.createCity(cityPayload);
            if (initCity === undefined) fail("must be defined");
            expect(initCity.cityId).toBeDefined();
            console.log(initCity, "40rm");
            cityId = initCity.cityId;
        } catch (err) {
            fail(err + "49rm");
        }
    });
    test("spam tasks", async () => {
        try {
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
            console.log(t, "55rm");
            expect(t.batch).toBe(1);
        } catch (err) {
            console.log(err);
            fail(err + "73rm");
            // expect(true).toBe(false); // fail
            // fail("some error2");
        }
    });
});
