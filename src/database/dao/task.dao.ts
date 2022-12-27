import { Op } from "sequelize";
import moment from "moment";
//
import { ProviderEnum } from "../../enum/provider.enum";
import { Task, TaskCreationAttributes } from "../models/Task";

class TaskDAO {
    constructor() {}

    public createTask = (task: TaskCreationAttributes) => {
        try {
            return Task.create(task);
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getMultipleTasks = (limit: number, offset?: number) => {
        try {
            return Task.findAndCountAll({ offset, limit });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getTaskById = (id: number) => {
        try {
            return Task.findByPk(id);
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getHighestBatchNum = () => {
        try {
            return Task.findOne({ order: [["batch", "DESC"]] }); // fixme: shouldnt this be "batchId"?
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getMostRecentTaskForProvider = (provider: ProviderEnum, batchNum?: number) => {
        try {
            let conditions;
            if (batchNum) {
                conditions = { providerName: provider, batchId: batchNum };
            } else {
                conditions = { providerName: provider };
            }
            return Task.findAll({
                limit: 1,
                where: conditions,
                order: [["createdAt", "DESC"]],
            });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getTasksByBatchNum = (batchNum: number) => {
        try {
            console.log(batchNum, "50rm");
            return Task.findAll({ where: { batchId: batchNum } });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    // Can't work because it doesn't allow create with associations.
    // public  bulkCreateTask = (tasks: TaskCreationAttributes[]) => {
    //     return Task.bulkCreate(tasks);
    // };

    public getNextUnfinishedTaskForProvider = (provider: ProviderEnum, batchNum?: number) => {
        try {
            let conditions;
            if (batchNum) {
                conditions = { providerName: provider, batchId: batchNum };
            } else {
                conditions = { providerName: provider };
            }
            console.log("conditions", conditions, "44rm");
            return Task.findAll({
                limit: 1,
                where: conditions,
                order: [["createdAt", "DESC"]],
            });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getAllUnfinishedTasksForProvider = (provider: ProviderEnum, batchNum?: number) => {
        try {
            let conditions;
            if (batchNum) {
                conditions = { providerName: provider, lastScan: null, batchId: batchNum };
            } else {
                conditions = { providerName: provider, lastScan: null };
            }
            return Task.findAll({
                where: conditions,
                order: [["createdAt", "DESC"]],
            });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getAllTasks = (providerName?: ProviderEnum, batchId?: number, cityId?: number) => {
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
            return Task.findAll({ where: conditions });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public updateTask = (task: TaskCreationAttributes, id: number) => {
        try {
            return Task.update(task, { where: { taskId: id } });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public updateLastScanDate = (t: Task, scanDate: Date) => {
        try {
            t.lastScan = scanDate;
            t.save();
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public deleteTask = (taskId: number) => {
        try {
            return Task.destroy({ where: { taskId } });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public deleteAll = () => {
        try {
            return Task.destroy({ where: {} });
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public deleteTasksOlderThanTwoMonths = () => {
        try {
            return Task.destroy({
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
