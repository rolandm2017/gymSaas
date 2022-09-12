import { Task, TaskCreationAttributes } from "../models/Task";

export const getMultipleTasks = (limit: number, offset?: number) => {
    return Task.findAndCountAll({ offset, limit });
};

export const getTaskById = (id: number) => {
    return Task.findByPk(id);
};

export const createTask = (task: TaskCreationAttributes, zoomWidth: number) => {
    return Task.create(task);
};

export const updateTask = (task: TaskCreationAttributes, id: number) => {
    return Task.update(task, { where: { id } });
};

export const deleteTask = (id: number) => {
    return Task.destroy({ where: { id } });
};
