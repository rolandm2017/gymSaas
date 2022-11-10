import { getCurrentBatchNum, updateBatchNum, _currentBatchNumForNewBatches } from "../../src/database/batchNumCache";
import BatchDAO from "../../src/database/dao/batch.dao";

const batchDAO: BatchDAO = new BatchDAO();

describe("test the batch num cache", () => {
    test("we can update the batch num", async () => {
        updateBatchNum(3);
        expect(_currentBatchNumForNewBatches).toBe(3);
    });
    test("we can extract the batch num when it is set without touching the db", async () => {
        // Note: this test depends on the one before it ...
        const fakeBatchDao = { getHighestBatchNum: jest.fn(), addBatchNum: jest.fn() };
        const current = await getCurrentBatchNum(fakeBatchDao);
        expect(fakeBatchDao.getHighestBatchNum).not.toHaveBeenCalled();
        expect(current).toBe(3);
    });
});
