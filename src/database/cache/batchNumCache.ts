import BatchDAO from "../dao/batch.dao";

export let _usedBatchNumbers: number[] = [];

export async function getBatchNumForNewBatches(batchDAO: BatchDAO): Promise<number> {
    if (_usedBatchNumbers.length != 0) return _usedBatchNumbers[_usedBatchNumbers.length - 1];
    const batchWithHighestNum = await batchDAO.getHighestBatchNum();
    if (batchWithHighestNum === null) {
        _usedBatchNumbers = [0];
        await batchDAO.addBatchNum(0);
    }
    const batchNumForNewBatches = _usedBatchNumbers.length !== 0 ? _usedBatchNumbers[_usedBatchNumbers.length - 1] : 0;
    return batchNumForNewBatches;
}

export async function setBatchNumForNewBatches(newNum: number, batchDAO: BatchDAO): Promise<number[]> {
    const newNumIsLowerThanHighest = _usedBatchNumbers[_usedBatchNumbers.length - 1] > newNum;
    if (newNumIsLowerThanHighest) return []; // was previously throw new Error("Can't decrease batch num")
    _usedBatchNumbers.push(newNum);
    await batchDAO.addBatchNum(newNum);
    return _usedBatchNumbers; // return value is returned for inspection
}

export async function addBatchNumIfNotExists(newNum: number, batchDAO: BatchDAO): Promise<number[]> {
    const exists = _usedBatchNumbers.includes(newNum);
    if (exists) return []; // its already in the cache? do nothing!
    else {
        const _usedBatchNumbers = await setBatchNumForNewBatches(newNum, batchDAO);
        return [..._usedBatchNumbers]; // return value is returned for inspection
    }
}

export function initBatchCacheFromDb(numsFromDb: number[]) {
    _usedBatchNumbers = numsFromDb;
}

export function getAllBatchNums() {
    return _usedBatchNumbers;
}
