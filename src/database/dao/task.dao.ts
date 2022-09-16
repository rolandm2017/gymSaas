import { Task, TaskCreationAttributes } from "../models/Task";

export const getMultipleTasks = (limit: number, offset?: number) => {
    return Task.findAndCountAll({ offset, limit });
};

export const getTaskById = (id: number) => {
    return Task.findByPk(id);
};

export const createTask = (task: TaskCreationAttributes) => {
    return Task.create(task);
};

// Can't work because it doesn't allow create with associations.
// export const bulkCreateTask = (tasks: TaskCreationAttributes[]) => {
//     return Task.bulkCreate(tasks);
// };

export const updateTask = (task: TaskCreationAttributes, id: number) => {
    return Task.update(task, { where: { id } });
};

export const deleteTask = (id: number) => {
    return Task.destroy({ where: { id } });
};
