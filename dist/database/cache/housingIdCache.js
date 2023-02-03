"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setHousingIdFromDb = exports.incrementHousingId = exports.readNextHousingId = void 0;
let housingId = undefined;
function readNextHousingId() {
    if (housingId === undefined)
        return 0;
    return housingId;
}
exports.readNextHousingId = readNextHousingId;
function incrementHousingId() {
    if (housingId === undefined) {
        housingId = 0;
    }
    housingId++;
}
exports.incrementHousingId = incrementHousingId;
function setHousingIdFromDb(current) {
    housingId = current;
}
exports.setHousingIdFromDb = setHousingIdFromDb;
