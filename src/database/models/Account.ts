import { DataTypes, Sequelize, Model, Optional } from "sequelize";

import sequelizeConnection from "../Database";

interface AccountAttributes {
    id: number;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
// export interface AccountInput extends Required<AccountAttributes> {}
// export interface AccountOutput extends Required<AccountAttributes> {}

export type AccountOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type AccountCreationAttributes = Optional<AccountAttributes, AccountOptionalAttributes>;

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
    public id!: number;
    public email!: string;
    public password!: string;
    public isVerified!: boolean;

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
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                isVerified: {
                    type: DataTypes.BOOLEAN,
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
