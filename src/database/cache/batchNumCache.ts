import BatchDAO from "../dao/batch.dao";

export let _currentBatchNumForNewBatches: number | undefined = undefined;

export async function getBatchNumForNewBatches(batchDAO: BatchDAO): Promise<number> {
    if (_currentBatchNumForNewBatches) return _currentBatchNumForNewBatches;
    console.log("10rm");
    const batchWithHighestNum = await batchDAO.getHighestBatchNum();
    if (batchWithHighestNum === null) {
        _currentBatchNumForNewBatches = 0;
        await batchDAO.addBatchNum(0);
    }
    _currentBatchNumForNewBatches = batchWithHighestNum ? batchWithHighestNum : 0;
    return _currentBatchNumForNewBatches;
}

export async function setBatchNum(newNum: number) {
    if (_currentBatchNumForNewBatches && newNum < _currentBatchNumForNewBatches) throw new Error("Can't decrease batch num");
    _currentBatchNumForNewBatches = newNum;
}
