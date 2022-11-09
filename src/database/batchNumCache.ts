import TaskDAO from "./dao/task.dao";

export let currentBatchNum: number | undefined = undefined;

const taskDAO = new TaskDAO();

export async function getCurrentBatchNum(): Promise<number> {
    if (currentBatchNum) return currentBatchNum;
    const taskWithHighestNumberedBatchInDb = await taskDAO.getHighestBatchNum();
    if (taskWithHighestNumberedBatchInDb === null) throw new Error("No task found in db");
    currentBatchNum = taskWithHighestNumberedBatchInDb.batch;
    return currentBatchNum;
}

export async function updateBatchNum(newNum: number) {
    if (currentBatchNum && newNum < currentBatchNum) throw new Error("Can't decrease batch num");
    currentBatchNum = newNum;
}
