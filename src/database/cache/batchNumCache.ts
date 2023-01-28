import BatchDAO from "../dao/batch.dao";

export let _usedBatchNumbers: number[] = [];

export async function getBatchNumForNewBatches(batchDAO: BatchDAO): Promise<number> {
    // checks the variable,
    // then asks the db for one (and puts it into the variable if its there).
    // value is returned from first location its found in.
    if (_usedBatchNumbers.length != 0) {
        return _usedBatchNumbers[_usedBatchNumbers.length - 1];
    }
    const highestBatchNum = await batchDAO.getHighestBatchNum();
    if (highestBatchNum === null) {
        _usedBatchNumbers = [0];
        await batchDAO.addBatchNum(0);
        return 0;
    } else {
        _usedBatchNumbers = [highestBatchNum];
        return highestBatchNum;
    }
}

export async function setBatchNumForNewBatches(newNum: number, batchDAO: BatchDAO): Promise<number[]> {
    _usedBatchNumbers.push(newNum);
    await batchDAO.addBatchNum(newNum);
    return _usedBatchNumbers; // cache is returned for inspection
}

export async function addBatchNumIfNotExists(newNum: number, batchDAO: BatchDAO): Promise<number[]> {
    const exists = _usedBatchNumbers.includes(newNum);
    console.log(_usedBatchNumbers, "31rm");
    if (exists || _isTooLow(newNum)) {
        return [..._usedBatchNumbers]; // its already in the cache? return it.
    } else {
        const _updatedBatchNums = await setBatchNumForNewBatches(newNum, batchDAO);
        return [..._updatedBatchNums]; // cache is returned for inspection
    }
}

export function initBatchCacheFromDb(numsFromDb: number[]) {
    _usedBatchNumbers = numsFromDb;
}

export function getAllBatchNums() {
    return _usedBatchNumbers;
}

export function resetBatchCache() {
    _usedBatchNumbers = [];
}

function _isTooLow(newNum: number) {
    // was previously throw new Error("Can't decrease batch num") if condition
    return _usedBatchNumbers[_usedBatchNumbers.length - 1] > newNum;
}
