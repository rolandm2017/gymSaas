import { DataTypes, Sequelize, Model, Optional } from "sequelize";

import sequelizeConnection from "../Database";

interface RefreshTokenAttributes {
    accountId: number; // todo: link to User model
    token: string;
    isActive: boolean;
    expires: Date;
    createdByIp: string;
    revoked?: number; // time since utc init represented as # of ms
    revokedByIp?: string;
    replacedByToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type RefreshTokenOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type RefreshTokenCreationAttributes = Optional<RefreshTokenAttributes, RefreshTokenOptionalAttributes>;

export class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
    public accountId!: number;
    public token!: string;
    public isActive!: boolean;
    public expires!: Date;
    public createdByIp!: string;
    public revoked!: number;
    public revokedByIp!: string;
    public replacedByToken!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof RefreshToken {
        return RefreshToken.init(
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
                isActive: {
                    type: DataTypes.BOOLEAN,
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
                    type: DataTypes.INTEGER,
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
