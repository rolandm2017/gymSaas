import { getBatchNumForNewBatches, setBatchNum, _currentBatchNumForNewBatches } from "../../src/database/cache/batchNumCache";
import BatchDAO from "../../src/database/dao/batch.dao";

const batchDAO: BatchDAO = new BatchDAO();

describe("test the batch num cache", () => {
    test("we can update the batch num", async () => {
        setBatchNum(3);
        expect(_currentBatchNumForNewBatches).toBe(3);
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
