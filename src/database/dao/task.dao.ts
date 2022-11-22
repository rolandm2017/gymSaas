import sequelize, { Op } from "sequelize";
import moment from "moment";
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

    public getTasksByBatchNum = (batchNum: number) => {
        return Task.findAll({ where: { batch: batchNum } });
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

    public getAllTasks = (filters: GetAllTasksFilters) => {
        return Task.findAll({ where: { ...filters } });
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
