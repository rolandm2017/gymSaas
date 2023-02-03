"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const sequelize_1 = require("sequelize");
class Task extends sequelize_1.Model {
    static initModel(sequelize) {
        return Task.init({
            taskId: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            providerName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            lat: {
                type: sequelize_1.DataTypes.DOUBLE,
                allowNull: false,
            },
            long: {
                type: sequelize_1.DataTypes.DOUBLE,
                allowNull: false,
            },
            zoomWidth: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
            },
            lastScan: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            ignore: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
            },
        }, {
            timestamps: true,
            sequelize: sequelize,
        });
    }
}
exports.Task = Task;
