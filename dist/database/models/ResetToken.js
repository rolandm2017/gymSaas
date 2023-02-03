"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetToken = void 0;
const sequelize_1 = require("sequelize");
class ResetToken extends sequelize_1.Model {
    static initModel(sequelize) {
        return ResetToken.init({
            tokenId: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            token: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            expires: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
        }, {
            timestamps: true,
            sequelize: sequelize,
        });
    }
}
exports.ResetToken = ResetToken;
