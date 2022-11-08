import request from "supertest";
import TaskDAO from "../../src/database/dao/task.dao";
import { ProviderEnum } from "../../src/enum/provider.enum";
import { CityEnum } from "../../src/enum/city.enum";

import { app, server } from "../mocks/mockServer";

const taskDAO = new TaskDAO();

const testTasks = [
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
];

let miniPayloadRentCanada;

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("task");
    // add some data so tests have sth to work with
    miniPayloadRentCanada = {
        provider: ProviderEnum.rentCanada,
        city: CityEnum.montreal,
        coords: testTasks,
    };
    await request(server).post("/task_queue/queue_grid_scan").send(miniPayloadRentCanada);
});

afterAll(async () => {
    await app.closeDB();
});

describe("test taskQueue controller", () => {
    test("retrieve queued tasks from the queue - works [integration]", async () => {
        const allTasksViaEndpoint = await request(server).get("/task_queue/all");
        expect(allTasksViaEndpoint.body.all.length).toEqual(testTasks.length);
    });
    test("add tasks to the task queue - works [integration]", async () => {
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
    });
    test("we can retrieve tasks per provider - works [integration]", async () => {
        await app.dropTable("task");
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
            ],
        };
        const miniPayloadRentSeeker = {
            provider: ProviderEnum.rentSeeker,
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
                {
                    long: -73.7581861890309,
                    lat: 45.596501933215316,
                    index: 2,
                },
            ],
        };
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

    test("report tasks' results into db and mark them complete - works for rentCanada [integration]", async () => {
        // speculative payload
        const payload = { provider: ProviderEnum.rentCanada };
    });

    test("report tasks' results into db and mark them complete - works for rentFaster [integration]", async () => {
        // speculative payload
        const payload = { provider: ProviderEnum.rentFaster };
    });

    test("report tasks' results into db and mark them complete - works for rentSeeker [integration]", async () => {
        // speculative payload
        const payload = { provider: ProviderEnum.rentSeeker };
    });
});
