"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
const sequelize_1 = require("sequelize");
class Account extends sequelize_1.Model {
    static initModel(sequelize) {
        return Account.init({
            acctId: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            passwordHash: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            isVerified: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
            },
            verificationToken: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            updated: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            role: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            passwordReset: {
                type: sequelize_1.DataTypes.BIGINT,
                allowNull: true,
            },
            isBanned: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
            },
            googleId: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            credits: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            ipAddress: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
        }, {
            timestamps: true,
            sequelize: sequelize,
            paranoid: false,
        });
    }
}
exports.Account = Account;
