import { DataTypes, Sequelize, Model, Optional } from "sequelize";

import sequelizeConnection from "../Database";

interface RefreshTokenAttributes {
    accountId: number; // todo: link to User model
    token: string;
    expires: Date;
    createdByIp: string;
    revoked: Date;
    revokedByIp: string;
    replacedByToken: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type RefreshTokenOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type RefreshTokenCreationAttributes = Optional<RefreshTokenAttributes, RefreshTokenOptionalAttributes>;

export class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
    public accountId!: number;
    public token!: string;
    public expires!: Date;
    public createdByIp!: string;
    public revoked!: Date;
    public revokedByIp!: string;
    public replacedByToken!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof RefreshToken {
        return RefreshToken.init(
            {
                accountId: {
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
                createdByIp: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                revoked: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                revokedByIp: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                replacedByToken: {
                    type: DataTypes.STRING,
                    allowNull: true,
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
