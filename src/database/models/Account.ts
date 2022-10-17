import { DataTypes, Sequelize, Model, Optional } from "sequelize";
import { Role } from "../../enum/role.enum";

import sequelizeConnection from "../Database";

interface AccountAttributes {
    id: number;
    email: string;
    passwordHash: string;
    isVerified: boolean;
    verificationToken: string;
    verified: number;
    updated: number;
    role: string;
    passwordReset: number; // Date.now()
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type AccountOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type AccountCreationAttributes = Optional<AccountAttributes, AccountOptionalAttributes>;

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
    public id!: number;
    public email!: string;
    public passwordHash!: string;
    public isVerified!: boolean;
    public verificationToken!: string;
    public verified!: number;
    public updated!: number;
    public role!: string;
    public passwordReset!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Account {
        return Account.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                passwordHash: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                isVerified: {
                    type: DataTypes.BOOLEAN,
                    allowNull: true,
                },
                verificationToken: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                verified: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                updated: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                role: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                passwordReset: {
                    type: DataTypes.INTEGER,
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
