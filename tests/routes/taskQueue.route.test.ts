import request from "supertest";
//
import TaskDAO from "../../src/database/dao/task.dao";
import { ProviderEnum } from "../../src/enum/provider.enum";
import { CityNameEnum } from "../../src/enum/cityName.enum";
import { Task } from "../../src/database/models/Task";
import BatchDAO from "../../src/database/dao/batch.dao";
import { smlCanada } from "../mocks/smallRealResults/smlCanada";
import { smlFaster } from "../mocks/smallRealResults/smlFaster";
import { smlSeeker } from "../mocks/smallRealResults/smlSeeker";
import { testTasks } from "../mocks/testTasks";
import { app, server } from "../mocks/mockServer";
import CacheService from "../../src/service/cache.service";
import CityDAO from "../../src/database/dao/city.dao";

const miniPayloadRentCanada = {
    provider: ProviderEnum.rentCanada,
    cityName: CityNameEnum.montreal,
    coords: testTasks[0],
    zoomWidth: 10,
    batchNum: 0,
};
const miniPayloadRentFaster = {
    provider: ProviderEnum.rentFaster,
    cityName: CityNameEnum.montreal,
    coords: testTasks[1],
    zoomWidth: 10,
    batchNum: 0,
};
const miniPayloadRentSeeker = {
    provider: ProviderEnum.rentSeeker,
    cityName: CityNameEnum.montreal,
    coords: testTasks[2],
    zoomWidth: 10,
    batchNum: 0,
};

const cityDAO = new CityDAO();
const batchDAO = new BatchDAO();
const cacheService = new CacheService(cityDAO, batchDAO);

beforeAll(async () => {
    await app.connectDB();
    // await app.seedDb();
});

beforeEach(async () => {
    await app.dropTable("task");
    await app.dropTable("housing");
    await app.dropTable("batch");
});

afterAll(async () => {
    await app.closeDB();
});

describe("Test taskQueue controller with supertest", () => {
    let batchNum = 0;
    test("health check!", async () => {
        const healthCheckRes = await request(server).get("/task_queue/health_check");
        expect(healthCheckRes.body.status).toBe("Online");
    });
    test("we can get the batch number", async () => {
        // we can get the batch number...but we have to create one first
        // const newlyCreatedBatch = await batchDAO.addBatchNum(onlyBatchNumInSystem);
        await cacheService.addBatchNumIfNotExists(0);
        await cacheService.addBatchNumIfNotExists(1);
        const targetBatchNumForTests = 2;
        const newlyCreatedBatch = await cacheService.addBatchNumIfNotExists(targetBatchNumForTests);
        expect(newlyCreatedBatch).toBeDefined();
        if (newlyCreatedBatch === undefined) fail("adding if not exists should return an array, and it didn't!");
        const currentBatchNumResponse = await request(server).get("/task_queue/next_batch_number");
        const currentBatchNum = currentBatchNumResponse.body.nextBatchNum;
        expect(currentBatchNum).toBe(targetBatchNumForTests);
        batchNum = currentBatchNum; // used in the next test
    });
    test("retrieve queued tasks from the queue - works [integration]", async () => {
        await app.dropTable("task");
        // add some data so tests have sth to work with
        const batchNumForThisTest = 1;
        await batchDAO.addBatchNum(batchNumForThisTest);

        miniPayloadRentCanada.batchNum = batchNumForThisTest;
        miniPayloadRentFaster.batchNum = batchNumForThisTest;
        const queued = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
        const queued2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
        const queuedBody = queued.body;
        const queuedBody2 = queued2.body;
        expect(queuedBody.queued.pass).toBe(miniPayloadRentCanada.coords.length); // not the real point of the test, but, sanity
        expect(queuedBody2.queued.pass).toBe(miniPayloadRentFaster.coords.length); // not the real point of the test, but, sanity
        const allTasksViaEndpoint = await request(server).get("/task_queue/all");
        expect(allTasksViaEndpoint.body.tasks.length).toEqual(miniPayloadRentCanada.coords.length + miniPayloadRentFaster.coords.length);
    });
    test("add tasks to the task queue - works [integration]", async () => {
        const batchNumForThisTest = 1;
        await batchDAO.addBatchNum(batchNumForThisTest);

        // 2nd payload, another provider
        const miniPayloadRentFaster2 = {
            provider: ProviderEnum.rentFaster,
            cityName: CityNameEnum.montreal,
            coords: [
                {
                    lat: 45.5019,
                    long: -73.5674,
                    index: 0,
                },
                {
                    long: -73.66279309451045,
                    lat: 45.54920096660751,
                    index: 1,
                },
                {
                    long: -73.7581861890209,
                    lat: 45.596501933215016,
                    index: 2,
                },
            ],
            zoomWidth: 10,
            batchNum: batchNumForThisTest,
        };
        const queuedScan = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster2);
        const queuedScanBody = queuedScan.body;
        expect(queuedScanBody.queued.pass).toBe(miniPayloadRentFaster.coords.length);
    });
    test("we can retrieve tasks per provider - works [integration]", async () => {
        // arrange
        const batchNumForThisTest = 555;
        miniPayloadRentFaster.batchNum = batchNumForThisTest;
        miniPayloadRentSeeker.batchNum = batchNumForThisTest;
        const queued = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
        const queued2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentSeeker);
        expect(true).toEqual(true);
        // test that inputs work!
        expect(queued.body.queued.pass).toEqual(miniPayloadRentFaster.coords.length);
        expect(queued2.body.queued.pass).toEqual(miniPayloadRentSeeker.coords.length);
        expect(miniPayloadRentFaster.coords.length).not.toEqual(miniPayloadRentSeeker.coords.length); // testing inputs
        // act
        const payload = { provider: ProviderEnum.rentSeeker, batchNum: batchNumForThisTest };
        const allTasksFromEndpoint = await request(server).get("/task_queue/next_tasks_for_scraper").send(payload);
        const payload2 = { provider: ProviderEnum.rentFaster, batchNum: batchNumForThisTest };
        const allTasksFromEndpoint2 = await request(server).get("/task_queue/next_tasks_for_scraper").send(payload2);
        // assert
        // done like this for inspection w/ debugger
        const allTasksBody = allTasksFromEndpoint.body;
        const allTasksBody2 = allTasksFromEndpoint2.body;
        const inputTasksLength = miniPayloadRentSeeker.coords.length;
        const inputTasksLength2 = miniPayloadRentFaster.coords.length;
        const tasksLength = allTasksBody.tasks.length;
        const tasksLength2 = allTasksBody2.tasks.length;
        expect(inputTasksLength).toEqual(tasksLength);
        expect(inputTasksLength2).toEqual(tasksLength2);
        // ...
    });

    describe("Marking complete works", () => {
        test("report tasks' results into db and mark them complete - works for rentCanada [integration]", async () => {
            await app.dropTable("task");
            await app.dropTable("batch");
            const allBatchNums = await batchDAO.getAllBatchNums();
            const batchNumForIntegrationTest = 1111;
            miniPayloadRentCanada.batchNum = batchNumForIntegrationTest;
            miniPayloadRentFaster.batchNum = batchNumForIntegrationTest;
            miniPayloadRentSeeker.batchNum = batchNumForIntegrationTest;

            const tasks1 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
            const tasks2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
            const tasks3 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentSeeker);
            // speculative payload
            const payload = { provider: miniPayloadRentCanada.provider };
            // get all tasks for rentCanada, mark them complete.
            const tasksResponse = await request(server).get("/task_queue/next_tasks_for_scraper").send(payload);
            expect(tasksResponse.body.tasks).toBeDefined();
            expect(tasksResponse.body.tasks.length).toEqual(miniPayloadRentCanada.coords.length);
            const tasksReceived = tasksResponse.body.tasks.length;
            console.log(tasksResponse.body.tasks.map((t: Task) => t.taskId));
            const findingsPayloads = tasksResponse.body.tasks.map((t: Task) => {
                return {
                    provider: ProviderEnum.rentCanada,
                    taskId: t.taskId,
                    apartments: smlCanada.results,
                };
            });
            let tasksTriedToComplete = 0;
            // temp
            const taskDAO = new TaskDAO();
            const tasks = await taskDAO.getAllTasks();
            console.log(tasks.map((t: Task) => t.taskId));
            for (let i = 0; i < findingsPayloads.length; i++) {
                const completedTasksResponse = await request(server).post("/task_queue/report_findings_and_mark_complete").send(findingsPayloads[i]);
                // now all the ones for rentCanada should be marked complete
                expect(completedTasksResponse.body.markedComplete).toBe(true);
                expect(completedTasksResponse.body.successfullyLogged.pass).toBe(findingsPayloads[i].apartments.listings.length);
                expect(completedTasksResponse.body.taskId).toBe(findingsPayloads[i].taskId);
                tasksTriedToComplete++;
            }
            expect(tasksReceived === tasksTriedToComplete).toBe(true); // testing inputs.
            // now verify that all tasks for this provider are completed.
            const allTasksForThisProvider = await request(server).get("/task_queue/all").send(payload);
            const allTasksAreCompleted = allTasksForThisProvider.body.tasks.every((task: Task) => task.lastScan !== null);
            expect(allTasksAreCompleted).toBe(true);
            // tasks for providers we didn't file reports for are still incomplete!
            payload.provider = ProviderEnum.rentSeeker;
            const allTasksForThisProvider2 = await request(server).get("/task_queue/all").send(payload);
            const allTasksAreIncomplete = allTasksForThisProvider2.body.tasks.every((task: Task) => task.lastScan === null);
            expect(allTasksAreIncomplete).toBe(true);
        });

        test("report tasks' results into db and mark them complete - works for rentFaster [integration]", async () => {
            await app.dropTable("task");
            const batchNumForIntegrationTest = 1112;
            miniPayloadRentCanada.batchNum = batchNumForIntegrationTest;
            miniPayloadRentFaster.batchNum = batchNumForIntegrationTest;
            miniPayloadRentSeeker.batchNum = batchNumForIntegrationTest;
            await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
            await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
            await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentSeeker);
            // speculative payload
            const payload = { provider: ProviderEnum.rentFaster };
            const tasksResponse = await request(server).get("/task_queue/next_tasks_for_scraper").send(payload);
            expect(tasksResponse.body.tasks).toBeDefined();
            expect(tasksResponse.body.tasks.length).toBeGreaterThan(1);
            const tasksReceived = tasksResponse.body.tasks.length;
            const findingsPayloads = tasksResponse.body.tasks.map((t: Task) => {
                return {
                    provider: ProviderEnum.rentFaster,
                    taskId: t.taskId,
                    apartments: smlFaster.results,
                };
            });
            let tasksTriedToComplete = 0;
            for (let i = 0; i < findingsPayloads.length; i++) {
                const completedTasksResponse = await request(server).post("/task_queue/report_findings_and_mark_complete").send(findingsPayloads[i]);
                // now all the ones for rentFaster should be marked complete
                expect(completedTasksResponse.body.markedComplete).toBe(true);
                expect(completedTasksResponse.body.successfullyLogged.pass).toBe(findingsPayloads[i].apartments.listings.length);
                expect(completedTasksResponse.body.taskId).toBe(findingsPayloads[i].taskId);
                tasksTriedToComplete++;
            }
            expect(tasksReceived === tasksTriedToComplete).toBe(true); // testing inputs.
            // now verify that all tasks for this provider are completed.
            const allTasksForThisProvider = await request(server).get("/task_queue/all").send(payload);
            const allTasksAreCompleted = allTasksForThisProvider.body.tasks.every((task: Task) => task.lastScan !== null);
            expect(allTasksAreCompleted).toBe(true);
            // tasks for providers we didn't file reports for are still incomplete!
            payload.provider = ProviderEnum.rentCanada;
            const allTasksForThisProvider2 = await request(server).get("/task_queue/all").send(payload);
            const allTasksAreIncomplete = allTasksForThisProvider2.body.tasks.every((task: Task) => task.lastScan === null);
            expect(allTasksAreIncomplete).toBe(true);
        });

        test("report tasks' results into db and mark them complete - works for rentSeeker [integration]", async () => {
            await app.dropTable("task");
            const batchNumForIntegrationTest = 1113;
            miniPayloadRentCanada.batchNum = batchNumForIntegrationTest;
            miniPayloadRentFaster.batchNum = batchNumForIntegrationTest;
            miniPayloadRentSeeker.batchNum = batchNumForIntegrationTest;
            await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
            await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
            await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentSeeker);
            // speculative payload
            const payload = { provider: ProviderEnum.rentSeeker };
            const tasksResponse = await request(server).get("/task_queue/next_tasks_for_scraper").send(payload);
            expect(tasksResponse.body.tasks).toBeDefined();
            expect(tasksResponse.body.tasks.length).toBeGreaterThan(1);
            const tasksReceived = tasksResponse.body.tasks.length;
            const findingsPayloads = tasksResponse.body.tasks.map((t: Task) => {
                return {
                    provider: ProviderEnum.rentSeeker,
                    taskId: t.taskId,
                    apartments: smlSeeker.results,
                };
            });
            let tasksTriedToComplete = 0;
            for (let i = 0; i < findingsPayloads.length; i++) {
                const completedTasksResponse = await request(server).post("/task_queue/report_findings_and_mark_complete").send(findingsPayloads[i]);
                // now all the ones for rentSeeker should be marked complete
                expect(completedTasksResponse.body.markedComplete).toBe(true); // note that "results.hits" is for rentSeeker
                expect(completedTasksResponse.body.successfullyLogged.pass).toBe(findingsPayloads[i].apartments.hits.length);
                expect(completedTasksResponse.body.taskId).toBe(findingsPayloads[i].taskId);
                tasksTriedToComplete++;
            }
            expect(tasksReceived === tasksTriedToComplete).toBe(true); // testing inputs.
            // now verify that all tasks for this provider are completed.
            const allTasksForThisProvider = await request(server).get("/task_queue/all").send(payload);
            const allTasksAreCompleted = allTasksForThisProvider.body.tasks.every((task: Task) => task.lastScan !== null);
            expect(allTasksAreCompleted).toBe(true);
            // tasks for providers we didn't file reports for are still incomplete!
            payload.provider = ProviderEnum.rentFaster;
            const allTasksForThisProvider2 = await request(server).get("/task_queue/all").send(payload);
            const allTasksAreIncomplete = allTasksForThisProvider2.body.tasks.every((task: Task) => task.lastScan === null);
            expect(allTasksAreIncomplete).toBe(true);
        });
    });
});
