"use strict";
// sorry canada
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const sequelize_1 = require("sequelize");
class State extends sequelize_1.Model {
    static initModel(sequelize) {
        return State.init({
            stateId: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            country: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
        }, {
            timestamps: true,
            sequelize: sequelize,
        });
    }
}
exports.State = State;
