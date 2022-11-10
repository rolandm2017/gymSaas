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
    // await app.dropTable("city");
});

afterAll(async () => {
    await app.closeDB();
});

describe("confirm city DAO works as expected", () => {
    test("we can create a city", async () => {
        const cityPayload: CityCreationAttributes = {
            city: "montreal",
            state: "quebec",
            country: "canada",
            centerLat: 50,
            centerLong: 50,
            scanRadius: 25,
            lastScan: null,
        };
        const initCity = await cityDAO.createCity(cityPayload);
        console.log(initCity, "34rm");
        expect(initCity.cityId).toBeDefined();
    });
});
