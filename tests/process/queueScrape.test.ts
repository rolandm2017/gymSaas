// // ***
// // documenting the process of queuing a scrape.
// // This is "how to use the web scraping service as the admin".
// // the Scraper microservice MUST be running for this to work.
// // ***
import request from "supertest";
import BatchDAO from "../../src/database/dao/batch.dao";
import CityDAO from "../../src/database/dao/city.dao";
import GymDAO from "../../src/database/dao/gym.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import StateDAO from "../../src/database/dao/state.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import { GymCreationAttributes } from "../../src/database/models/Gym";
import { CityNameEnum } from "../../src/enum/cityName.enum";
import { ProviderEnum } from "../../src/enum/provider.enum";
import { SEED_CITIES } from "../../src/seed/seedCities";

import { MAX_ACCEPTABLE_LATITUDE_DIFFERENCE, MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE } from "../../src/util/acceptableRadiusForWalking";
import { dummyGymData } from "../mocks/dummyGyms/dummyGyms";
import { app, server } from "../mocks/mockServer";
import { realResultsRentCanada } from "../mocks/realResults/rentCanada";
import { smlCanada } from "../mocks/smallRealResults/smlCanada";
import { smlFaster } from "../mocks/smallRealResults/smlFaster";
import { smlSeeker } from "../mocks/smallRealResults/smlSeeker";

console.log("Four minute walk from a gym in lat and long: ");
console.log(MAX_ACCEPTABLE_LATITUDE_DIFFERENCE, MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE);
const latLongRealResultsRentCanada = realResultsRentCanada.results.listings
    .map(listing => {
        return {
            latitude: listing.latitude,
            longitude: listing.longitude,
        };
    })
    .sort(function (a, b) {
        if (a.latitude == b.latitude) return a.longitude - b.longitude;
        return a.latitude - b.latitude;
    }); // 45.45092 deg lat to 45.55468 deg lat

// beforeAll(async () => {
//     await app.connectDB();
// });

// afterAll(async () => {
//     await app.closeDB();
// });

function makeUnacceptablyFarLat(gymLocationLat: number, tooFarAwayAmount: number, northOrSouth: "north" | "south") {
    if (tooFarAwayAmount <= 0) throw new Error("must be greater than 0");
    if (northOrSouth === "north") return gymLocationLat + tooFarAwayAmount + MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
    if (northOrSouth === "south") return gymLocationLat - tooFarAwayAmount - MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
}

function makeUnacceptablyFarLong(gymLocLong: number, tooFarAwayAmount: number, eastOrWest: "east" | "west") {
    if (tooFarAwayAmount <= 0) throw new Error("must be greater than 0");
    // negative value becoming smaller, because its moving further east towards 0
    if (eastOrWest === "east") return gymLocLong + tooFarAwayAmount + MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE; // + because getting closer to 0
    // negative value becoming even bigger, because its moving further west
    if (eastOrWest === "west") return gymLocLong - tooFarAwayAmount - MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
}

// find which apartments are within range of a gym
const minAcceptableLat = dummyGymData[0].lat - MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
const maxAcceptableLat = dummyGymData[0].lat + MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
const minAcceptableLong = dummyGymData[0].long - MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
const maxAcceptableLong = dummyGymData[0].long + MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
// console.log(minAcceptableLat, maxAcceptableLat);
// console.log(minAcceptableLong, maxAcceptableLong);
const qualifiedApartmentsForThatOneGym = latLongRealResultsRentCanada.filter(
    ap => ap.latitude > minAcceptableLat && ap.latitude < maxAcceptableLat && ap.longitude > minAcceptableLong && ap.longitude < maxAcceptableLong,
);
const minAcceptableLat1 = dummyGymData[1].lat - MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
const maxAcceptableLat1 = dummyGymData[1].lat + MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
const minAcceptableLong1 = dummyGymData[1].long - MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
const maxAcceptableLong1 = dummyGymData[1].long + MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
const qualifiedApartmentsForThatOtherGym = latLongRealResultsRentCanada.filter(
    ap =>
        ap.latitude > minAcceptableLat1 && ap.latitude < maxAcceptableLat1 && ap.longitude > minAcceptableLong1 && ap.longitude < maxAcceptableLong1,
);

const expectedQualifiedApartments = qualifiedApartmentsForThatOneGym.length + qualifiedApartmentsForThatOtherGym.length;
// 4 + 15 = 19

const testTargetCityId = SEED_CITIES[9].cityId;
const dummyDataBatchNum = 5;

const dummyApartmentData = {
    provider: ProviderEnum.rentCanada,
    taskId: 0, // will set later
    apartments: realResultsRentCanada.results,
    cityId: testTargetCityId,
    batchNum: dummyDataBatchNum,
};

const gymDAO: GymDAO = new GymDAO();

// **
// the first step, finding the viewport width, can't be done because it requires the external scraping microservice.
// hence it would be too costly to run.
// **

beforeAll(async () => {
    await app.connectDB();
});

afterAll(async () => {
    await app.closeDB();
});

describe("steps 2 through 5 of the scraping process works for batches of apartments", () => {
    beforeAll(async () => {
        app.dropTable("task");
        app.dropTable("housing");
        // put 2 gyms into the db
        for (const gym of dummyGymData) {
            const foundGyms = await gymDAO.getGymByAddress(gym.address);
            if (foundGyms.length > 0) continue; // do not add same gym twice.
            gymDAO.createGym(gym);
        }
    });

    test("we qualify apartments and delete the ones not near a gym", async () => {
        // step 2 - plan grid
        const planGridPayload = {
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
        const planGridResponse = await request(server).post("/task_queue/plan_grid_scan").send(planGridPayload);
        const tasks = planGridResponse.body.gridCoords;
        expect(tasks.length).toBeGreaterThan(30);
        // step 3 - queue scan
        const queueGridScanPayload = {
            provider: "rentCanada",
            cityName: "Montreal",
            batchNum: 1,
            zoomWidth: 13,
            coords: tasks,
        };
        const queuedGridScanResponse = await request(server).post("/task_queue/queue_grid_scan").send(queueGridScanPayload);
        expect(queuedGridScanResponse.body.queued.pass).toBe(queueGridScanPayload.coords.length); // all pass
        // confirm all tasks have a cityId!

        // step 3.5 - report findings. Here we simulate the scraper responding with apartments.
        // put "realResultsRentCanada.results.length" apartments with various locations into the db
        const taskDAO = new TaskDAO(); // make sure the dummyApartmentData is associated with a real task.
        const taskIds = await taskDAO.getAllTasks();
        dummyApartmentData.taskId = taskIds[0].taskId;
        // have to make sure the batch num exists
        const batchDAO = new BatchDAO();
        batchDAO.addBatchNum(dummyDataBatchNum);
        await request(server).post("/task_queue/report_findings_and_mark_complete").send(dummyApartmentData);

        // step 4 - qualify
        const targetCityName = SEED_CITIES[9].cityName;
        const qualificationResponse = await request(server).get("/housing/qualify").query({ cityName: targetCityName });
        expect(qualificationResponse.body.qualified).toBe(expectedQualifiedApartments);
        expect(qualificationResponse.body.outOf).toBe(dummyApartmentData.apartments.listings.length);
        const qualifiedPercent = qualificationResponse.body.qualified / qualificationResponse.body.outOf;
        expect(qualificationResponse.body.percent).toBe(qualifiedPercent);
        const expectedDeletedAps = qualificationResponse.body.outOf - qualificationResponse.body.qualified;
        // step 5 - delete the unqualified
        const deletedResponse = await request(server).delete("/housing/unqualified").query({ cityName: targetCityName });
        expect(deletedResponse.body.numberOfDeleted).toBe(expectedDeletedAps);
    });
});
