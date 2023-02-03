"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetBatchCache = exports.getAllBatchNums = exports.initBatchCacheFromDb = exports.addBatchNumIfNotExists = exports.setBatchNumForNewBatches = exports.getBatchNumForNewBatches = exports._usedBatchNumbers = void 0;
exports._usedBatchNumbers = [];
function getBatchNumForNewBatches(batchDAO) {
    return __awaiter(this, void 0, void 0, function* () {
        // checks the variable,
        // then asks the db for one (and puts it into the variable if its there).
        // value is returned from first location its found in.
        if (exports._usedBatchNumbers.length != 0) {
            return exports._usedBatchNumbers[exports._usedBatchNumbers.length - 1];
        }
        const highestBatchNum = yield batchDAO.getHighestBatchNum();
        if (highestBatchNum === null) {
            exports._usedBatchNumbers = [0];
            yield batchDAO.addBatchNum(0);
            return 0;
        }
        else {
            exports._usedBatchNumbers = [highestBatchNum];
            return highestBatchNum;
        }
    });
}
exports.getBatchNumForNewBatches = getBatchNumForNewBatches;
function setBatchNumForNewBatches(newNum, batchDAO) {
    return __awaiter(this, void 0, void 0, function* () {
        exports._usedBatchNumbers.push(newNum);
        yield batchDAO.addBatchNum(newNum);
        return exports._usedBatchNumbers; // cache is returned for inspection
    });
}
exports.setBatchNumForNewBatches = setBatchNumForNewBatches;
function addBatchNumIfNotExists(newNum, batchDAO) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = exports._usedBatchNumbers.includes(newNum);
        if (exists || _isTooLow(newNum)) {
            return [...exports._usedBatchNumbers]; // its already in the cache? return it.
        }
        else {
            const _updatedBatchNums = yield setBatchNumForNewBatches(newNum, batchDAO);
            return [..._updatedBatchNums]; // cache is returned for inspection
        }
    });
}
exports.addBatchNumIfNotExists = addBatchNumIfNotExists;
function initBatchCacheFromDb(numsFromDb) {
    exports._usedBatchNumbers = numsFromDb;
}
exports.initBatchCacheFromDb = initBatchCacheFromDb;
function getAllBatchNums() {
    return exports._usedBatchNumbers;
}
exports.getAllBatchNums = getAllBatchNums;
function resetBatchCache() {
    exports._usedBatchNumbers = [];
}
exports.resetBatchCache = resetBatchCache;
function _isTooLow(newNum) {
    // was previously throw new Error("Can't decrease batch num") if condition
    return exports._usedBatchNumbers[exports._usedBatchNumbers.length - 1] > newNum;
}
