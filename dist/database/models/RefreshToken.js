"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const sequelize_1 = require("sequelize");
class RefreshToken extends sequelize_1.Model {
    static initModel(sequelize) {
        return RefreshToken.init({
            tokenId: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            token: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
            },
            expires: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            createdByIp: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            revoked: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            revokedByIp: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            replacedByToken: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
        }, {
            timestamps: true,
            sequelize: sequelize,
            paranoid: true,
        });
    }
}
exports.RefreshToken = RefreshToken;
