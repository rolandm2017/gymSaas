"use strict";
// sorry canada
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feedback = void 0;
const sequelize_1 = require("sequelize");
class Feedback extends sequelize_1.Model {
    static initModel(sequelize) {
        return Feedback.init({
            feedbackId: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            questionOne: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            questionOneAnswer: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            questionTwo: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            questionTwoAnswer: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            questionThree: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            questionThreeAnswer: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            largeTextAnswer: {
                type: sequelize_1.DataTypes.STRING,
            },
            featureReqOneAnswer: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            featureReqTwoAnswer: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            submitted: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: true,
            },
        }, {
            timestamps: true,
            sequelize: sequelize,
            paranoid: true,
        });
    }
}
exports.Feedback = Feedback;
