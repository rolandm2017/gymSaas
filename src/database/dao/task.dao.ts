import { Op } from "sequelize";
import moment from "moment";
//
import { ProviderEnum } from "../../enum/provider.enum";
import { Task, TaskCreationAttributes } from "../models/Task";

interface GetAllTasksFilters {
    providerName?: ProviderEnum;
    batchId?: number;
    cityId?: number;
}

class TaskDAO {
    constructor() {}

    public createTask = (task: TaskCreationAttributes) => {
        try {
            return Task.create(task);
        } catch (err) {
            console.log(err);
        }
    };

    public getMultipleTasks = (limit: number, offset?: number) => {
        return Task.findAndCountAll({ offset, limit });
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
        return Task.findOne({ order: [["batch", "DESC"]] });
    };

    public getMostRecentTaskForProvider = (provider: ProviderEnum, batchNum?: number) => {
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
    };

    public getTasksByBatchNum = (batchNum: number) => {
        console.log(batchNum, "50rm");
        return Task.findAll({ where: { batchId: batchNum } });
    };

    // Can't work because it doesn't allow create with associations.
    // public  bulkCreateTask = (tasks: TaskCreationAttributes[]) => {
    //     return Task.bulkCreate(tasks);
    // };

    public getNextUnfinishedTaskForProvider = (provider: ProviderEnum, batchNum?: number) => {
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
        return Task.destroy({ where: { taskId } });
    };

    public deleteAll = () => {
        return Task.destroy({ where: {} });
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
