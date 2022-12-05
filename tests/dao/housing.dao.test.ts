import BatchDAO from "../../src/database/dao/batch.dao";
import CityDAO from "../../src/database/dao/city.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import StateDAO from "../../src/database/dao/state.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import { CityCreationAttributes } from "../../src/database/models/City";
import { HousingCreationAttributes } from "../../src/database/models/Housing";
import { TaskCreationAttributes } from "../../src/database/models/Task";
import { AgreementTypeEnum } from "../../src/enum/agreementType.enum";
import { BuildingTypeEnum } from "../../src/enum/buildingType.enum";
import { ProviderEnum } from "../../src/enum/provider.enum";
import { SEED_CITIES } from "../../src/seed/seedCities";
import { app } from "../mocks/mockServer";
import { smlCanada } from "../mocks/smallRealResults/smlCanada";

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
            nearAGym: null,
            source: ProviderEnum.rentCanada,
            idAtSource: 5,
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
            nearAGym: null,
            source: ProviderEnum.rentCanada,
            idAtSource: 6,
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
            nearAGym: null,
            source: ProviderEnum.rentCanada,
            idAtSource: 7,
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
    test("mark qualified works as expected", async () => {
        // arrange
        const dummyCity = SEED_CITIES[5];
        await cityDAO.createCity(dummyCity); // so city with
        const targetCityId = dummyCity.cityId;
        const targetTaskId = 6;
        const someIrrelevantBatchId = 333;
        const batchDAO = new BatchDAO();
        await batchDAO.addBatchNum(someIrrelevantBatchId);
        const taskDAO = new TaskDAO();
        const taskToCreate: TaskCreationAttributes = {
            lastScan: null,
            lat: 45,
            long: 45,
            providerName: ProviderEnum.rentCanada,
            taskId: targetTaskId,
            zoomWidth: 10,
            batchId: someIrrelevantBatchId,
        };
        try {
            await taskDAO.createTask(taskToCreate);
        } catch (err) {
            console.log(err);
            console.log(err);
        }
        // put in some apartments
        const apartmentsToAdd = smlCanada.results.listings;
        try {
            for (const apartment of apartmentsToAdd) {
                const payload: HousingCreationAttributes = {
                    buildingType: "APARTMENT",
                    agreementType: "RENTAL",
                    address: apartment.address,
                    price: 500,
                    source: ProviderEnum.rentCanada,
                    url: "MIA but not a problem",
                    lat: apartment.latitude,
                    long: apartment.longitude,
                    idAtSource: apartment.id,
                    stateId: 5,
                    taskId: targetTaskId,
                    cityId: targetCityId,
                    batchId: someIrrelevantBatchId,
                    nearAGym: null,
                };
                await housingDAO.createHousing(payload);
            }
        } catch (errrr) {
            console.log(errrr);
            console.log(errrr);
        }
        if (targetCityId == undefined) fail("city id was undefined somehow");
        // act
        const r = await housingDAO.markQualified(targetCityId, 40, 50, -80, -70);
        // check that $between works the way I think it does
        const temp = await housingDAO.betweenTest(40, 50, -80, -70);
        console.log(
            temp.map(ap => [ap.lat, ap.long, ap.nearAGym, ap.housingId]),
            "144rm",
        );
        const temp2 = await housingDAO.getAllHousing();
        console.log(
            temp2.map(ap => [ap.lat, ap.long, ap.housingId]),
            "146rm",
        );
        console.log(r, "158rm");
        // assert
        expect(r).toBe(apartmentsToAdd.length);
    });
});
