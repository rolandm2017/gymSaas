import CityDAO from "../../src/database/dao/city.dao";
import { CityCreationAttributes } from "../../src/database/models/City";
// mock stuff
import { app } from "../mocks/mockServer";

let cityDAO: CityDAO = new CityDAO();

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("city");
});

afterAll(async () => {
    await app.closeDB();
});

describe("confirm city DAO works as expected", () => {
    test("we can create a city", async () => {
        const cityPayload: CityCreationAttributes = {
            cityName: "montreal",
            country: "canada",
            centerLat: 50,
            centerLong: 50,
            scanRadius: 25,
            lastScan: null,
        };
        const initCity = await cityDAO.createCity(cityPayload);
        if (initCity === undefined) fail("must be defined");
        expect(initCity.cityId).toBeDefined();
    });
});
