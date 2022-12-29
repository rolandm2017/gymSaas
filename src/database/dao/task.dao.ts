import { Op } from "sequelize";
import moment from "moment";
//
import { ProviderEnum } from "../../enum/provider.enum";
import { Task, TaskCreationAttributes } from "../models/Task";
import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { Batch } from "../models/Batch";

class TaskDAO {
    constructor() {}

    public createTask = async (task: TaskCreationAttributes) => {
        return await Task.create(task);
    };

    public getMultipleTasks = async (limit: number, offset?: number): Promise<{ rows: Task[]; count: number }> => {
        return await Task.findAndCountAll({ offset, limit });
    };

    public getTaskById = async (id: number) => {
        return await Task.findByPk(id);
    };

    public getHighestBatchNum = async () => {
        return await Task.findOne({ order: [["batchId", "DESC"]] }); // fixme: shouldnt this be "batchId"?
    };

    public getMostRecentTaskForProvider = async (provider: ProviderEnum, batchNum?: number) => {
        let conditions;
        if (batchNum) {
            conditions = { providerName: provider, batchId: batchNum };
        } else {
            conditions = { providerName: provider };
        }
        return await Task.findAll({
            limit: 1,
            where: conditions,
            order: [["createdAt", "DESC"]],
        });
    };

    public getTasksByBatchNum = async (batchNum: number) => {
        return await Task.findAll({ where: { batchId: batchNum } });
    };

    // Can't work because it doesn't allow create with associations.
    // public  bulkCreateTask = (tasks: TaskCreationAttributes[]) => {
    //     return Task.bulkCreate(tasks);
    // };

    public getNextUnfinishedTaskForProvider = async (provider: ProviderEnum, batchNum?: number) => {
        let conditions;
        if (batchNum) {
            conditions = { providerName: provider, batchId: batchNum };
        } else {
            conditions = { providerName: provider };
        }
        return await Task.findAll({
            limit: 1,
            where: conditions,
            order: [["createdAt", "DESC"]],
        });
    };

    public getAllUnfinishedTasksForProvider = async (provider: ProviderEnum, batchNum?: number) => {
        let conditions;
        if (batchNum) {
            conditions = { providerName: provider, lastScan: null, batchId: batchNum };
        } else {
            conditions = { providerName: provider, lastScan: null };
        }
        return await Task.findAll({
            where: conditions,
            order: [["createdAt", "DESC"]],
        });
    };

    public getAllTasks = async (providerName?: ProviderEnum, batchId?: number, cityId?: number) => {
        // even finished ones.
        let conditions;
        if (providerName && batchId && cityId) {
            conditions = { providerName, batchId, cityId };
        } else if (providerName && batchId) {
            conditions = { providerName, batchId };
        } else if (batchId && cityId) {
            conditions = { batchId, cityId };
        } else if (providerName && cityId) {
            conditions = { providerName, cityId };
        } else if (providerName) {
            conditions = { providerName };
        } else if (batchId) {
            conditions = { batchId };
        } else if (cityId) {
            conditions = { cityId };
        } else {
            conditions = {};
        }
        return await Task.findAll({ where: conditions });
    };

    public getScorecard = async (providerName: ProviderEnum, batchNum: number) => {
        try {
            return await Task.findAll({
                where: { providerName, batchId: batchNum },
            });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public updateTask = async (task: TaskCreationAttributes, id: number) => {
        return await Task.update(task, { where: { taskId: id } });
    };

    public updateLastScanDate = async (task: Task, scanDate: Date): Promise<void> => {
        task.lastScan = scanDate;
        await task.save();
    };

    public deleteTask = async (taskId: number) => {
        return await Task.destroy({ where: { taskId } });
    };

    public deleteAll = async () => {
        return await Task.destroy({ where: {} });
    };

    public deleteTasksOlderThanTwoMonths = async () => {
        return await Task.destroy({
            where: {
                createdAt: { [Op.lte]: moment().subtract(2, "months").toDate() },
            },
        });
    };
}

export default TaskDAO;
