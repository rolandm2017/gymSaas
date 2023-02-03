"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySuccessFilter = void 0;
const successFilter_enum_1 = require("../enum/successFilter.enum");
function applySuccessFilter(tasks, filter) {
    if (filter === successFilter_enum_1.SuccessFilterEnum.all)
        return tasks;
    // if the task has a lastScan !== null and ignore is still false, it was a successful scan!
    if (filter === successFilter_enum_1.SuccessFilterEnum.success)
        return tasks.filter((t) => t.lastScan !== null && t.ignore === false);
    if (filter === successFilter_enum_1.SuccessFilterEnum.ignored)
        return tasks.filter((t) => t.ignore);
    throw Error("Invalid filter type");
}
exports.applySuccessFilter = applySuccessFilter;
