import { DataTypes, Sequelize, Model, Optional, ForeignKey } from "sequelize";

import { Account } from "./Account";

interface ResetTokenAttributes {
    tokenId?: number;
    token: string;
    expires: Date;
    acctId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type ResetTokenOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type ResetTokenCreationAttributes = Optional<ResetTokenAttributes, ResetTokenOptionalAttributes>;

export class ResetToken extends Model<ResetTokenAttributes, ResetTokenCreationAttributes> implements ResetTokenAttributes {
    public tokenId!: number;
    public token!: string;
    public expires!: Date;
    public acctId!: ForeignKey<Account["acctId"]>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof ResetToken {
        return ResetToken.init(
            {
                tokenId: {
                    type: DataTypes.INTEGER,
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
                sequelize: sequelize,
            },
        );
    }
}
