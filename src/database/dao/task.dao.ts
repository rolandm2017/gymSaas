import sequelize, { Op } from "sequelize";
import moment from "moment";
import { ProviderEnum } from "../../enum/provider.enum";
import { Task, TaskCreationAttributes } from "../models/Task";

class TaskDAO {
    constructor() {}

    public getMultipleTasks = (limit: number, offset?: number) => {
        return Task.findAndCountAll({ offset, limit });
    };

    public getTaskById = (id: number) => {
        return Task.findByPk(id);
    };

    public getHighestBatchNum = () => {
        return Task.findOne({ order: [["batch", "DESC"]] });
    };

    public getMostRecentTaskForProvider = (provider: ProviderEnum, batchNum?: number) => {
        let conditions;
        if (batchNum) {
            conditions = { providerName: provider, batch: batchNum };
        } else {
            conditions = { providerName: provider };
        }
        return Task.findAll({
            limit: 1,
            where: conditions,
            order: [["createdAt", "DESC"]],
        });
    };

    public createTask = (task: TaskCreationAttributes) => {
        try {
            return Task.create(task);
        } catch (err) {
            console.log(err);
        }
    };

    // Can't work because it doesn't allow create with associations.
    // public  bulkCreateTask = (tasks: TaskCreationAttributes[]) => {
    //     return Task.bulkCreate(tasks);
    // };

    public getNextUnfinishedTaskForProvider = (provider: ProviderEnum, batchNum?: number) => {
        let conditions;
        if (batchNum) {
            conditions = { providerName: provider, batch: batchNum };
        } else {
            conditions = { providerName: provider };
        }
        console.log("conditions", conditions, "44rm");
        return Task.findAll({
            limit: 1,
            where: conditions,
            order: [["createdAt", "DESC"]],
        });
    };

    // public getAllUnfinishedBatchesForProvider = async (provider: ProviderEnum) => {
    //     // note: used to be "getNextUnfinishedBatch" but was impossible to figure out implementation
    //     // note nov 8: this will be difficult to implement, costly to execute. what is the fastest way to do it?
    //     const tasks = await Task.findAll({
    //         where: { providerName: provider },
    //         order: [["createdAt", "DESC"]],
    //     });
    //     const currentBatch = [];
    //     const unfinishedBatches = [];
    //     let endOfCurrentBatch = 0;
    //     for (let i = 0; i < tasks.length; i++) {
    //         const currentTask = tasks[i]
    //         if (tasks[i + 1])
    //     }
    // };

    public getAllUnfinishedTasksForProvider = (provider: ProviderEnum, batchNum?: number) => {
        let conditions;
        if (batchNum) {
            conditions = { providerName: provider, lastScan: null, batch: batchNum };
        } else {
            conditions = { providerName: provider, lastScan: null };
        }
        return Task.findAll({
            where: conditions,
            order: [["createdAt", "DESC"]],
        });
    };

    public getAllTasks = (choice?: ProviderEnum, batchId?: number) => {
        if (choice) {
            return Task.findAll({ where: { providerName: choice } });
        } else if (batchId) {
            return Task.findAll({ where: { batchId } });
        } else if (choice && batchId) {
            return Task.findAll({ where: { providerName: choice, batchId } });
        } else {
            return Task.findAll({ where: {} });
        }
    };

    public updateTask = (task: TaskCreationAttributes, id: number) => {
        return Task.update(task, { where: { taskId: id } });
    };

    public updateLastScanDate = (t: Task, scanDate: Date) => {
        t.lastScan = scanDate;
        t.save();
    };

    public deleteTask = (taskId: number) => {
        return Task.destroy({ where: { taskId } });
    };

    public deleteTasksOlderThanTwoMonths = () => {
        return Task.destroy({
            where: {
                createdAt: { [Op.lte]: moment().subtract(2, "months").toDate() },
            },
        });
    };
}

export default TaskDAO;
