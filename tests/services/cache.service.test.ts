// todo

import { _usedBatchNumbers } from "../../src/database/cache/batchNumCache";
import BatchDAO from "../../src/database/dao/batch.dao";
import CityDAO from "../../src/database/dao/city.dao";
import CacheService from "../../src/service/cache.service";
import { app } from "../mocks/mockServer";

const cityDAO = new CityDAO();
const batchDAO = new BatchDAO();
const cacheService = new CacheService(cityDAO, batchDAO);

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("batch");
    await cacheService.initCityIdCache(); // hence expect all city ids to be in the cache
    await cacheService.initBatchCache(); // but 0 batch ids because we dropped the table!
});

beforeEach(async () => {
    await app.dropTable("batch");
    cacheService.clearBatchCache();
});

describe("test the cache service", () => {
    // yes even though there are tests in ../dbUtil, more tests here!
    describe("batch number stuff", () => {
        //
        test("batch table is empty when the tests start", async () => {
            const batchNums = await batchDAO.getAllBatchNums();
            expect(batchNums.length).toEqual(0);
            const batchNumsViaCacheService = await cacheService.getAllBatchNums();
            expect(batchNumsViaCacheService.length).toEqual(0);
        });
        test("getBatchNumForNewBatches works correctly", async () => {
            //
            const highest = await cacheService.getBatchNumForNewBatches();
            expect(highest).toBe(0);
            const numsToAdd = [3, 4, 5, 6];
            await cacheService.addBatchNumIfNotExists(numsToAdd[0]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[1]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[2]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[3]);
            const highest2 = await cacheService.getBatchNumForNewBatches();
            expect(highest2).toBe(numsToAdd[3]);
        });
        test("getAllBatchNums works correctly", async () => {
            const numsToAdd = [3, 4, 5, 6];
            await cacheService.addBatchNumIfNotExists(numsToAdd[0]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[1]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[2]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[3]); // works even if i try to add the same value >1x
            await cacheService.addBatchNumIfNotExists(numsToAdd[3]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[3]);
            const all = await cacheService.getAllBatchNums();
            expect(all[0]).toEqual(numsToAdd[0]);
            expect(all[1]).toEqual(numsToAdd[1]);
            expect(all[2]).toEqual(numsToAdd[2]);
            expect(all[3]).toEqual(numsToAdd[3]);
        });
        test("setBatchNumForNewBatches adds a new num to the cache if it is higher than the last one", async () => {
            // arrange, act
            const cache = await cacheService.setBatchNumForNewBatches(15);
            const cache2 = await cacheService.setBatchNumForNewBatches(16);
            const cache3 = await cacheService.setBatchNumForNewBatches(17);
            const cache4 = await cacheService.setBatchNumForNewBatches(21);
            const allBatchNums = await batchDAO.getAllBatchNums();
            // assert
            expect(cache4[0]).toBe(15);
            expect(cache4[1]).toBe(16);
            expect(cache4[2]).toBe(17);
            expect(cache4[3]).toBe(21);
            expect(allBatchNums.includes(15)).toBe(true);
            expect(allBatchNums.includes(16)).toBe(true);
            expect(allBatchNums.includes(17)).toBe(true);
            expect(allBatchNums.includes(21)).toBe(true);
        });
        test("addBatchNumIfNotExists works correctly", async () => {
            // arrange, act
            const numsToAdd = [3, 4, 5, 6];
            await cacheService.addBatchNumIfNotExists(numsToAdd[0]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[1]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[1]); // nothing changes when 4 is added over and over
            await cacheService.addBatchNumIfNotExists(numsToAdd[1]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[1]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[1]);
            await cacheService.addBatchNumIfNotExists(numsToAdd[2]);
            const batchNums = await cacheService.addBatchNumIfNotExists(numsToAdd[3]);
            // assert
            expect(batchNums.length).toEqual(numsToAdd.length);
            const allBatchNums = await batchDAO.getAllBatchNums();
            expect(allBatchNums.length).toEqual(numsToAdd.length);
            expect(allBatchNums.includes(numsToAdd[0])).toBe(true);
            expect(allBatchNums.includes(numsToAdd[1])).toBe(true);
            expect(allBatchNums.includes(numsToAdd[2])).toBe(true);
            expect(_usedBatchNumbers.filter(n => n === numsToAdd[1]).length).toEqual(1); // despite adding 1 repeatedly,
            expect(_usedBatchNumbers.length).toBe(numsToAdd.length);
        });
    });
    describe("city id stuff", () => {
        //
    });
});
