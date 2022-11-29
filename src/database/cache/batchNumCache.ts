import BatchDAO from "../dao/batch.dao";

export let _usedBatchNumbers: number[] = [];

export async function getBatchNumForNewBatches(batchDAO: BatchDAO): Promise<number> {
    if (_usedBatchNumbers.length != 0) return _usedBatchNumbers[_usedBatchNumbers.length - 1];
    console.log("10rm");
    const batchWithHighestNum = await batchDAO.getHighestBatchNum();
    if (batchWithHighestNum === null) {
        _usedBatchNumbers = [0];
        await batchDAO.addBatchNum(0);
    }
    const batchNumForNewBatches = _usedBatchNumbers.length !== 0 ? _usedBatchNumbers[_usedBatchNumbers.length - 1] : 0;
    return batchNumForNewBatches;
}

export async function setBatchNumForNewBatches(newNum: number, batchDAO: BatchDAO) {
    const newNumIsLowerThanHighest = _usedBatchNumbers[_usedBatchNumbers.length - 1] > newNum;
    if (newNumIsLowerThanHighest) throw new Error("Can't decrease batch num");
    _usedBatchNumbers.push(newNum);
    await batchDAO.addBatchNum(newNum);
}

export async function addBatchNumIfNotExists(newNum: number, batchDAO: BatchDAO) {
    const exists = _usedBatchNumbers.includes(newNum);
    if (exists) return;
    else setBatchNumForNewBatches(newNum, batchDAO);
}

export function initBatchCacheFromDb(numsFromDb: number[]) {
    _usedBatchNumbers = numsFromDb;
}

export function getAllBatchNums() {
    return _usedBatchNumbers;
}
