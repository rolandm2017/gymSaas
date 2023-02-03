"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gym = void 0;
const sequelize_1 = require("sequelize");
class Gym extends sequelize_1.Model {
    static initModel(sequelize) {
        return Gym.init({
            gymId: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            cityName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            address: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            url: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            lat: {
                type: sequelize_1.DataTypes.DOUBLE,
                allowNull: false,
                unique: true,
            },
            long: {
                type: sequelize_1.DataTypes.DOUBLE,
                allowNull: false,
                unique: true,
            },
            icon: { type: sequelize_1.DataTypes.STRING, allowNull: true },
            name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
            rating: { type: sequelize_1.DataTypes.FLOAT, allowNull: true },
        }, {
            timestamps: true,
            sequelize: sequelize,
            paranoid: true, // because I don't want to accidentally delete the gyms I paid $ to get from google
        });
    }
}
exports.Gym = Gym;
