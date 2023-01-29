import { Task } from "../database/models/Task";
import { SuccessFilterEnum } from "../enum/successFilter.enum";

export function applySuccessFilter(tasks: Task[], filter: SuccessFilterEnum) {
    if (filter === SuccessFilterEnum.all) return tasks;
    // if the task has a lastScan !== null and ignore is still false, it was a successful scan!
    if (filter === SuccessFilterEnum.success) return tasks.filter((t: Task) => t.lastScan !== null && t.ignore === false);
    if (filter === SuccessFilterEnum.ignored) return tasks.filter((t: Task) => t.ignore);
    throw Error("Invalid filter type");
}
