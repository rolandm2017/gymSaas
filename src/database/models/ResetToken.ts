import { DataTypes, Sequelize, Model, Optional } from "sequelize";

import sequelizeConnection from "../Database";

interface ResetTokenAttributes {
    accountId: number; // todo: link to User model
    token: string;
    expires: Date;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type ResetTokenOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type ResetTokenCreationAttributes = Optional<ResetTokenAttributes, ResetTokenOptionalAttributes>;

export class ResetToken extends Model<ResetTokenAttributes, ResetTokenCreationAttributes> implements ResetTokenAttributes {
    public accountId!: number;
    public token!: string;
    public expires!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof ResetToken {
        return ResetToken.init(
            {
                accountId: {
                    type: DataTypes.INTEGER, // todo: link to user model.
                    autoIncrement: true,
                    primaryKey: true,
                },
                token: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                expires: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
            },
            {
                timestamps: true,
                sequelize: sequelizeConnection,
                paranoid: true,
            },
        );
    }
}
