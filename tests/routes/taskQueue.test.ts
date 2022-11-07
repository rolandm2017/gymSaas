import request from "supertest";
import TaskDAO from "../../src/database/dao/task.dao";
import { ProviderEnum } from "../../src/enum/provider.enum";
import { CityEnum } from "../../src/enum/city.enum";

import { app, server } from "../mocks/mockServer";

const taskDAO = new TaskDAO();

beforeAll(async () => {
    await app.connectDB();
});

beforeEach(async () => {
    await app.dropTable("task");
});

afterAll(async () => {
    await app.closeDB();
});

describe("test taskQueue controller", () => {
    test("add tasks to the task queue and then take them out [2 endpoints in 1 test]", async () => {
        // first mini payload, provider1
        const miniPayloadRentCanada = {
            provider: ProviderEnum.rentCanada,
            city: CityEnum.montreal,
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
                    long: -73.56703009451044,
                    lat: 45.54920096660751,
                    index: 1,
                },
                {
                    long: -73.47200690548956,
                    lat: 45.54920096660751,
                    index: 1,
                },
                {
                    long: -73.66279309451045,
                    lat: 45.45459903339249,
                    index: 1,
                },
                {
                    long: -73.66279309451045,
                    lat: 45.52201993339249,
                    index: 1,
                },
                {
                    long: -73.7581861890209,
                    lat: 45.596501933215016,
                    index: 2,
                },
            ],
        };
        const queuedScan = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
        expect(queuedScan.body.length).toBe(miniPayloadRentCanada.coords.length);
        // 2nd payload, another provider
        const miniPayloadRentFaster = {
            provider: ProviderEnum.rentFaster,
            city: CityEnum.montreal,
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
        };
        const queuedScan2 = await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentFaster);
        expect(queuedScan2.body.length).toBe(miniPayloadRentFaster.coords.length);
        // verify # of tasks in db matches
        const expectedTasksTotal = miniPayloadRentCanada.coords.length + miniPayloadRentFaster.coords.length;
        const allTasksDirectFromDb = await taskDAO.getAllTasks(); // db should be basically empty
        expect(allTasksDirectFromDb.length).toBe(expectedTasksTotal);
        // check that retrieval endpoint works PER SCRAPER
        const payload = { provider: ProviderEnum.rentCanada, batchNum: 0 };
        const allTasksFromEndpoint = await request(server).get("/task_queue/next_tasks_for_scraper").send(payload);
        expect(allTasksFromEndpoint.body.tasks.length).toEqual(miniPayloadRentCanada.coords.length);
        // check that retrieving all tasks at once is the expected value
        const allTasksViaEndpoint = await request(server).get("/task_queue/all");
        expect(allTasksViaEndpoint.body.all.length).toEqual(expectedTasksTotal);
    });
    test("retrieve queued tasks from the queue", async () => {
        //
    });
    test("report tasks' results into the database and mark them complete", async () => {
        //
    });
});
