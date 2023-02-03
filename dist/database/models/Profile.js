"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const sequelize_1 = require("sequelize");
class Profile extends sequelize_1.Model {
    static initModel(sequelize) {
        return Profile.init({
            profileId: {
                type: sequelize_1.DataTypes.INTEGER,
                unique: true,
                autoIncrement: true,
                primaryKey: true,
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
exports.Profile = Profile;
