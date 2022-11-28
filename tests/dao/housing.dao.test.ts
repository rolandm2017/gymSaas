import CityDAO from "../../src/database/dao/city.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import StateDAO from "../../src/database/dao/state.dao";
import { CityCreationAttributes } from "../../src/database/models/City";
import { HousingCreationAttributes } from "../../src/database/models/Housing";
import { AgreementTypeEnum } from "../../src/enum/agreementType.enum";
import { BuildingTypeEnum } from "../../src/enum/buildingType.enum";
import { app } from "../mocks/mockServer";

let cityDAO: CityDAO = new CityDAO();
const stateDAO: StateDAO = new StateDAO();
const housingDAO = new HousingDAO(stateDAO, cityDAO);

beforeAll(async () => {
    await app.connectDB();
    // await app.dropAllTables(); // takes too long
    await app.dropTable("city");
    await app.dropTable("housing");
});

beforeEach(async () => {});

afterAll(async () => {
    await app.closeDB();
});

describe("housingDAO tests", () => {
    test("we add 3 apartments to the db and then discover there are 3 in it", async () => {
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
        const ap1: HousingCreationAttributes = {
            buildingType: BuildingTypeEnum.apartment,
            agreementType: AgreementTypeEnum.rent,
            price: 100,
            address: "33 cats street",
            url: "google.ca",
            lat: 45,
            long: 45,
            cityId: initCity.cityId,
        };
        const ap2: HousingCreationAttributes = {
            buildingType: BuildingTypeEnum.apartment,
            agreementType: AgreementTypeEnum.rent,
            price: 100,
            address: "33 cats street",
            url: "google.ca",
            lat: 45,
            long: 45,
            cityId: initCity.cityId,
        };
        const ap3: HousingCreationAttributes = {
            buildingType: BuildingTypeEnum.apartment,
            agreementType: AgreementTypeEnum.rent,
            price: 100,
            address: "33 cats street",
            url: "google.ca",
            lat: 45,
            long: 45,
            cityId: initCity.cityId,
        };
        const ap1made = await housingDAO.createHousing(ap1);
        const ap2made = await housingDAO.createHousing(ap2);
        const ap3made = await housingDAO.createHousing(ap3);
        expect(ap1made.housingId).toBeDefined();
        expect(ap2made.housingId).toBeDefined();
        expect(ap3made.housingId).toBeDefined();
        const all = await housingDAO.getMultipleHousings();
        expect(all.count).toEqual(3);
    });
});
