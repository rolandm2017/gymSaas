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

const miniPayloadRentCanada = {
    provider: ProviderEnum.rentCanada,
    city: CityNameEnum.montreal,
    coords: testTasks[0],
    zoomWidth: 10,
    batchNum: 0,
};
const miniPayloadRentFaster = {
    provider: ProviderEnum.rentFaster,
    city: CityNameEnum.montreal,
    coords: testTasks[1],
    zoomWidth: 10,
    batchNum: 0,
};
const miniPayloadRentSeeker = {
    provider: ProviderEnum.rentSeeker,
    city: CityNameEnum.montreal,
    coords: testTasks[2],
    zoomWidth: 10,
    batchNum: 0,
};

beforeAll(async () => {
    await app.connectDB();
    await app.dropAllTables(); // takes too long
    await app.seedDb();
});

beforeEach(async () => {
    await app.dropTable("task");
    await app.dropTable("housing");
    await app.dropTable("batch");
});

afterAll(async () => {
    await app.dropAllTables();
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
        const batchDAO = new BatchDAO();
        const newlyCreatedBatch = await batchDAO.addBatchNum(1);
        const currentBatchNum = await request(server).get("/task_queue/next_batch_number");
        expect(currentBatchNum.body.nextBatchNum).toBe(newlyCreatedBatch?.batchId);
        batchNum = currentBatchNum.body.nextBatchNum;
    });
    test("retrieve queued tasks from the queue - works [integration]", async () => {
        await app.dropTable("task");
        // add some data so tests have sth to work with
        miniPayloadRentCanada.batchNum = batchNum;
        miniPayloadRentFaster.batchNum = batchNum;
        const queued = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
        const queued2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
        expect(queued.body.queued.pass).toBe(miniPayloadRentCanada.coords.length); // not the real point of the test, but, sanity
        expect(queued2.body.queued.pass).toBe(miniPayloadRentFaster.coords.length); // not the real point of the test, but, sanity
        const allTasksViaEndpoint = await request(server).get("/task_queue/all");
        expect(allTasksViaEndpoint.body.tasks.length).toEqual(miniPayloadRentCanada.coords.length + miniPayloadRentFaster.coords.length);
    });
    test("add tasks to the task queue - works [integration]", async () => {
        // 2nd payload, another provider
        const miniPayloadRentFaster = {
            provider: ProviderEnum.rentFaster,
            city: CityNameEnum.montreal,
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
            batchNum: batchNum,
        };
        const queuedScan2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
        expect(queuedScan2.body.queued.pass).toBe(miniPayloadRentFaster.coords.length);
    });
    test("we can retrieve tasks per provider - works [integration]", async () => {
        await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
        await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentSeeker);
        expect(miniPayloadRentFaster.coords.length).not.toEqual(miniPayloadRentSeeker.coords.length); // testing inputs
        const payload = { provider: ProviderEnum.rentSeeker, batchNum: 0 };
        const allTasksFromEndpoint = await request(server).get("/task_queue/next_tasks_for_scraper").send(payload);
        expect(allTasksFromEndpoint.body.tasks.length).toEqual(miniPayloadRentSeeker.coords.length);
        const payload2 = { provider: ProviderEnum.rentFaster, batchNum: 0 };
        const allTasksFromEndpoint2 = await request(server).get("/task_queue/next_tasks_for_scraper").send(payload2);
        expect(allTasksFromEndpoint2.body.tasks.length).toEqual(miniPayloadRentFaster.coords.length);
    });

    describe("Marking complete works", () => {
        test("report tasks' results into db and mark them complete - works for rentCanada [integration]", async () => {
            await app.dropTable("task");
            const tasks = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
            const tasks2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
            const tasks3 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentSeeker);
            // speculative payload
            const payload = { provider: ProviderEnum.rentCanada };
            // get all tasks for rentCanada, mark them complete.
            const tasksResponse = await request(server).get("/task_queue/next_tasks_for_scraper").send(payload);
            expect(tasksResponse.body.tasks).toBeDefined();
            expect(tasksResponse.body.tasks.length).toBeGreaterThan(1);
            const tasksReceived = tasksResponse.body.tasks.length;
            const findingsPayloads = tasksResponse.body.tasks.map((t: Task) => {
                return {
                    provider: ProviderEnum.rentCanada,
                    taskId: t.taskId,
                    apartments: smlCanada.results,
                };
            });
            let tasksTriedToComplete = 0;
            for (let i = 0; i < findingsPayloads.length; i++) {
                console.log(findingsPayloads[i].taskId, "198rm");
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
            // console.log(allTasksForThisProvider.body, "202rm");
            console.log(allTasksForThisProvider.body, "209rm");
            const allTasksAreCompleted = allTasksForThisProvider.body.tasks.every((task: Task) => task.lastScan !== null);
            expect(allTasksAreCompleted).toBe(true);
            // tasks for providers we didn't file reports for are still incomplete!
            payload.provider = ProviderEnum.rentSeeker;
            const allTasksForThisProvider2 = await request(server).get("/task_queue/all").send(payload);
            const allTasksAreIncomplete = allTasksForThisProvider2.body.tasks.every((task: Task) => task.lastScan === null);
            expect(allTasksAreIncomplete).toBe(true);
        });

        test("report tasks' results into db and mark them complete - works for rentFaster [integration]", async () => {
            const tasks = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
            const tasks2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
            const tasks3 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentSeeker);
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
            const tasks = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
            const tasks2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
            const tasks3 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentSeeker);
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
