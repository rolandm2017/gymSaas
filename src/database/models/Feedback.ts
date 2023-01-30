// sorry canada

import { Association, DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { Profile } from "./Profile";

// q1, q2, q3
// <Rating text="This helped me start or keep up a gym habit." valueReporter={setRatingOne} />
// <Rating text="I was able to find several apartments near a gym." valueReporter={setRatingTwo} />
// <Rating text="I would recommend this service to a friend." valueReporter={setRatingThree} />
export interface FeedbackAttributes {
    feedbackId?: number;
    questionOne: string;
    questionOneAnswer?: number; // number because they are star ratings.
    questionTwo: string;
    questionTwoAnswer?: number; // number because they are star ratings.
    questionThree: string;
    questionThreeAnswer?: number; // number because they are star ratings.
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
    public questionOneAnswer!: number;
    public questionTwo!: string;
    public questionTwoAnswer!: number;
    public questionThree!: string;
    public questionThreeAnswer!: number;
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
                    allowNull: true,
                },
                questionOneAnswer: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                questionTwo: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                questionTwoAnswer: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                questionThree: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                questionThreeAnswer: {
                    type: DataTypes.INTEGER,
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
