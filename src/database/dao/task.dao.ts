import sequelize, { Op } from "sequelize";
import moment from "moment";
import { ProviderEnum } from "../../enum/provider.enum";
import { Task, TaskCreationAttributes } from "../models/Task";

export const getMultipleTasks = (limit: number, offset?: number) => {
    return Task.findAndCountAll({ offset, limit });
};

export const getTaskById = (id: number) => {
    return Task.findByPk(id);
};

export const getMostRecentTaskForProvider = (provider: ProviderEnum, batchNum?: number) => {
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

export const createTask = (task: TaskCreationAttributes) => {
    return Task.create(task);
};

// Can't work because it doesn't allow create with associations.
// export const bulkCreateTask = (tasks: TaskCreationAttributes[]) => {
//     return Task.bulkCreate(tasks);
// };

export const getNextUnfinishedTaskForProvider = (provider: ProviderEnum, batchNum?: number) => {
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

export const getAllUnfinishedBatchesForProvider = (provider: ProviderEnum) => {
    // note: used to be "getNextUnfinishedBatch" but was impossible to figure out implementation
    return Task.findAll({
        where: { providerName: provider },
        order: [["createdAt", "DESC"]],
    });
};

export const getAllTasksForProvider = (provider: ProviderEnum) => {
    return Task.findAll({
        where: { providerName: provider },
    });
};

export const updateTask = (task: TaskCreationAttributes, id: number) => {
    return Task.update(task, { where: { id } });
};

export const deleteTask = (id: number) => {
    return Task.destroy({ where: { id } });
};

export const deleteTasksOlderThanTwoMonths = () => {
    return Task.destroy({
        where: {
            createdAt: { [Op.lte]: moment().subtract(2, "months").toDate() },
        },
    });
};
