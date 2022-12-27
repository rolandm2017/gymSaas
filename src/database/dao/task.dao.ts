import { Op } from "sequelize";
import moment from "moment";
//
import { ProviderEnum } from "../../enum/provider.enum";
import { Task, TaskCreationAttributes } from "../models/Task";

class TaskDAO {
    constructor() {}

    public createTask = async (task: TaskCreationAttributes) => {
        try {
            return await Task.create(task);
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getMultipleTasks = async (limit: number, offset?: number): Promise<{ rows: Task[]; count: number }> => {
        try {
            return await Task.findAndCountAll({ offset, limit });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getTaskById = async (id: number) => {
        try {
            return await Task.findByPk(id);
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getHighestBatchNum = async () => {
        try {
            return await Task.findOne({ order: [["batchId", "DESC"]] }); // fixme: shouldnt this be "batchId"?
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getMostRecentTaskForProvider = async (provider: ProviderEnum, batchNum?: number) => {
        try {
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
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getTasksByBatchNum = async (batchNum: number) => {
        try {
            return await Task.findAll({ where: { batchId: batchNum } });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    // Can't work because it doesn't allow create with associations.
    // public  bulkCreateTask = (tasks: TaskCreationAttributes[]) => {
    //     return Task.bulkCreate(tasks);
    // };

    public getNextUnfinishedTaskForProvider = async (provider: ProviderEnum, batchNum?: number) => {
        try {
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
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getAllUnfinishedTasksForProvider = async (provider: ProviderEnum, batchNum?: number) => {
        try {
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
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getAllTasks = async (providerName?: ProviderEnum, batchId?: number, cityId?: number) => {
        try {
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
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public updateTask = async (task: TaskCreationAttributes, id: number) => {
        try {
            return await Task.update(task, { where: { taskId: id } });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public updateLastScanDate = async (task: Task, scanDate: Date): Promise<void> => {
        try {
            task.lastScan = scanDate;
            await task.save();
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public deleteTask = async (taskId: number) => {
        try {
            return await Task.destroy({ where: { taskId } });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public deleteAll = async () => {
        try {
            return await Task.destroy({ where: {} });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public deleteTasksOlderThanTwoMonths = async () => {
        try {
            return await Task.destroy({
                where: {
                    createdAt: { [Op.lte]: moment().subtract(2, "months").toDate() },
                },
            });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };
}

export default TaskDAO;
