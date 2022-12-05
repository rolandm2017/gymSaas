import BatchDAO from "../../src/database/dao/batch.dao";
import CityDAO from "../../src/database/dao/city.dao";
import GymDAO from "../../src/database/dao/gym.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import StateDAO from "../../src/database/dao/state.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import { TaskCreationAttributes } from "../../src/database/models/Task";
import { ProviderEnum } from "../../src/enum/provider.enum";
import { IQualificationReport } from "../../src/interface/QualificationReport.interface";
import { SEED_CITIES } from "../../src/seed/seedCities";
import CacheService from "../../src/service/cache.service";
import HousingService from "../../src/service/housing.service";
import TaskQueueService from "../../src/service/taskQueue.service";
import { dummyGymData } from "../mocks/dummyGyms/dummyGyms";
import { app } from "../mocks/mockServer";
import { realResultsRentCanada } from "../mocks/realResults/rentCanada";

const stateDAO = new StateDAO();
const cityDAO = new CityDAO();
const batchDAO = new BatchDAO();
const taskDAO = new TaskDAO();

const housingDAO = new HousingDAO(stateDAO, cityDAO);
const gymDAO = new GymDAO();

const cacheService: CacheService = new CacheService(cityDAO, batchDAO);

const housingService: HousingService = new HousingService(housingDAO, gymDAO, cacheService);
const taskQueueService: TaskQueueService = new TaskQueueService(cityDAO, housingDAO, taskDAO, cacheService);

// arrange
const batchIdForTest = 3;
const targetCity = SEED_CITIES[9];
const dummyApartmentData = {
    provider: ProviderEnum.rentCanada,
    taskId: 0, // will set later
    apartments: realResultsRentCanada.results,
    cityId: targetCity.cityId,
    batchNum: batchIdForTest,
};

beforeAll(async () => {
    await app.connectDB();
    app.dropTable("task");
    app.dropTable("housing");

    await batchDAO.addBatchNum(batchIdForTest);
    const task: TaskCreationAttributes = {
        lastScan: null,
        lat: 45,
        long: 45,
        providerName: ProviderEnum.rentCanada,
        zoomWidth: 10,
        batchId: batchIdForTest,
    };
    const createdTask = await taskDAO.createTask(task); // so we don't get the error "orphaned task"
    if (createdTask === undefined) throw new Error("task creation failed");
    const allTasks = await taskDAO.getAllTasks();
    console.log(allTasks.map(t => t.taskId));
    console.log(dummyApartmentData.apartments.listings.length, "61rm");
    // insert them the way we'd expect in the real app.
    await taskQueueService.reportFindingsToDb(
        dummyApartmentData.provider,
        createdTask.taskId,
        dummyApartmentData.apartments,
        dummyApartmentData.cityId,
        dummyApartmentData.batchNum,
    );
    for (const gym of dummyGymData) {
        const foundGyms = await gymDAO.getGymByAddress(gym.address);
        if (foundGyms.length > 0) continue; // do not add same gym twice.
        gymDAO.createGym(gym);
    }
});

afterAll(async () => {
    await app.closeDB();
});

describe("test housing service on its own", () => {
    test("qualifying apartments works as expected", async () => {
        expect(true).toBe(false);
        const targetCityName = targetCity.cityName;
        const qualificationReport: IQualificationReport = await housingService.qualifyScrapedApartments(targetCityName);
        console.log(qualificationReport, "68rm");
    });
});
