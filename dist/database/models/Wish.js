"use strict";
// sorry canada
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wish = void 0;
const sequelize_1 = require("sequelize");
class Wish extends sequelize_1.Model {
    static initModel(sequelize) {
        return Wish.init({
            wishId: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            wishLocation: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
        }, {
            timestamps: true,
            sequelize: sequelize,
            paranoid: true,
        });
    }
}
exports.Wish = Wish;
