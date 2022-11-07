// ***
// documenting the process of queuing a scrape.
// the Scraper microservice MUST be running for this to work.
// ***
import request from "supertest";

import { app, server } from "../mocks/mockServer";

beforeAll(async () => {
    await app.connectDB();
});

afterAll(async () => {
    await app.closeDB();
});

describe("Queue a scrape for the engine", () => {
    // **
    // ** commented out b/c it takes way too long to run
    // **
    // test("[integration] I can get the viewport width", async () => {
    //     const payload = {
    //         city: "Montreal",
    //         state: "Quebec",
    //         country: "Canada",
    //     };
    //     const res = await request(server).get("/housing/viewport_width").send(payload);
    //     // 0 being a clear indication that something went wrong.
    //     expect(res.body.north).not.toEqual(0);
    //     expect(res.body.east).not.toEqual(0);
    //     expect(res.body.south).not.toEqual(0);
    //     expect(res.body.west).not.toEqual(0);
    //     expect(res.body.latitudeChange).not.toEqual(0);
    //     expect(res.body.longitudeChange).not.toEqual(0);
    // }, 20000);
    test("I can plan the grid with provided inputs", async () => {
        // populated using previous step's results.
        const payload = {
            startCoords: {
                lat: 45.5019,
                long: -73.5674,
            },
            bounds: {
                north: 45.5546838,
                east: -73.5426585,
                south: 45.4509234,
                west: -73.6094939,
                latitudeChange: 0.10376039999999875,
                longitudeChange: 0.06683540000000221,
                kmNorthSouth: 3.255716827047065,
                kmEastWest: 7.431757400259987,
            },
            radius: 24,
        };
        const res = await request(server).get("/housing/grid_scan_plan").send(payload);
        expect(res.body.length).toBeGreaterThan(1); // if 0, problem. If > 1, its fine.
    });
});
