import { getAllBatchNums, getBatchNumForNewBatches, setBatchNumForNewBatches, _usedBatchNumbers } from "../../src/database/cache/batchNumCache";
import BatchDAO from "../../src/database/dao/batch.dao";
import { app } from "../mocks/mockServer";

const batchDAO: BatchDAO = new BatchDAO();

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("batch");
});

beforeEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await app.closeDB();
});

describe("test the batch num cache", () => {
    test("init condition is predictably an empty array", async () => {
        const batches = getAllBatchNums();
        expect(batches.length).toBe(0);
    });
    test("we can update the batch num", async () => {
        batchDAO.addBatchNum = jest.fn();
        const testValue = 3;
        setBatchNumForNewBatches(testValue, batchDAO);
        expect(_usedBatchNumbers.includes(testValue)).toBe(true);
        expect(batchDAO.addBatchNum).toHaveBeenCalledWith(testValue);
    });
    test("we can extract the batch num when it is set without touching the db", async () => {
        // Note: this test depends on the one before it ...
        const fakeBatchDao = new BatchDAO();
        fakeBatchDao.getHighestBatchNum = jest.fn();
        fakeBatchDao.addBatchNum = jest.fn();
        const current = await getBatchNumForNewBatches(fakeBatchDao);
        expect(fakeBatchDao.getHighestBatchNum).not.toHaveBeenCalled();
        expect(current).toBe(3);
    });
});
