// sorry canada

import { Association, DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { Profile } from "./Profile";

export interface FeedbackAttributes {
    feedbackId?: number;
    questionOne: string;
    questionOneAnswer?: string;
    questionTwo: string;
    questionTwoAnswer?: string;
    largeTextAnswer?: string;
    submitted?: boolean | null;
    profileId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type FeedbackOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type FeedbackCreationAttributes = Optional<FeedbackAttributes, FeedbackOptionalAttributes>;

export class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
    public query!: string;
    public questionOne!: string;
    public questionOneAnswer!: string;
    public questionTwo!: string;
    public questionTwoAnswer!: string;
    public largeTextAnswer!: string;
    public submitted!: boolean;
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
                },
                questionOneAnswer: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                questionTwo: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                questionTwoAnswer: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                largeTextAnswer: {
                    type: DataTypes.STRING,
                },
                submitted: {
                    type: DataTypes.BOOLEAN,
                    allowNull: true,
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
