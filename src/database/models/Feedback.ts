// sorry canada

import { Association, DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { Profile } from "./Profile";

export interface FeedbackAttributes {
    feedbackId?: number;
    questionOne: string;
    questionOneAnswer?: string;
    questionTwo: string;
    questionTwoAnswer?: string;
    questionThree: string;
    questionThreeAnswer?: string;
    largeTextAnswer?: string;
    featureReqOneAnswer?: string;
    featureReqTwoAnswer?: string;
    submitted?: boolean | null;
    profileId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type FeedbackOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type FeedbackCreationAttributes = Optional<FeedbackAttributes, FeedbackOptionalAttributes>;

export class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
    public feedbackId!: number;
    public questionOne!: string;
    public questionOneAnswer!: string;
    public questionTwo!: string;
    public questionTwoAnswer!: string;
    public questionThree!: string;
    public questionThreeAnswer!: string;
    public largeTextAnswer!: string;
    public featureReqOneAnswer!: string;
    public featureReqTwoAnswer!: string;
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
                    autoIncrement: true,
                },
                questionOne: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                questionOneAnswer: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                questionTwo: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                questionTwoAnswer: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                questionThree: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                questionThreeAnswer: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                largeTextAnswer: {
                    type: DataTypes.STRING,
                },
                featureReqOneAnswer: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                featureReqTwoAnswer: {
                    type: DataTypes.STRING,
                    allowNull: true,
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
