"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.City = void 0;
const sequelize_1 = require("sequelize");
class City extends sequelize_1.Model {
    static initModel(sequelize) {
        return City.init({
            cityId: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            cityName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            country: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            centerLat: {
                type: sequelize_1.DataTypes.DOUBLE,
                allowNull: false,
            },
            centerLong: {
                type: sequelize_1.DataTypes.DOUBLE,
                allowNull: false,
            },
            scanRadius: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: false,
            },
            lastScan: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
        }, {
            timestamps: true,
            sequelize: sequelize,
        });
    }
}
exports.City = City;
