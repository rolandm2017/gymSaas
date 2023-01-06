// sorry canada

import { Association, DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { Profile } from "./Profile";

export interface FeedbackAttributes {
    feedbackId?: number;
    questionOne: string;
    questionOneAnswer: number;
    questionTwo: string;
    questionTwoAnswer: number;
    largeTextAnswer: string;
    profileId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type FeedbackOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type FeedbackCreationAttributes = Optional<FeedbackAttributes, FeedbackOptionalAttributes>;

export class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
    public query!: string;
    public questionOneText!: string;
    public questionOneAnswer!: number;
    public questionTwoText!: string;
    public questionTwoAnswer!: number;
    public largeTextAnswer!: string;
    public profileId!: ForeignKey<Profile["profileId"]>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Feedback {
        return Feedback.init(
            {
                feedbackId: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                },
                questionOne: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                questionOneAnswer: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                questionTwo: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                questionTwoAnswer: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                largeTextAnswer: {
                    type: DataTypes.STRING,
                },
            },
            {
                timestamps: true,
                sequelize: sequelize,
                paranoid: true,
            },
        );
    }
}
