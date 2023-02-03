"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Batch = void 0;
const sequelize_1 = require("sequelize");
class Batch extends sequelize_1.Model {
    //
    static initModel(sequelize) {
        return Batch.init({
            batchId: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: false,
                primaryKey: true,
                // unique: true, // no duplicate batch numbers
            },
        }, {
            timestamps: true,
            sequelize: sequelize,
        });
    }
}
exports.Batch = Batch;
