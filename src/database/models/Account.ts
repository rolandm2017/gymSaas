import Sequelize, { DataTypes, Sequelize as S, Model, Optional } from "sequelize";
import { Role } from "../../enum/role.enum";

interface AccountAttributes {
    acctId?: number;
    email: string;
    passwordHash: string;
    isVerified: boolean;
    verificationToken: string;
    updated: number;
    role: string;
    passwordReset: number; // Date.now()
    isBanned?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type AccountOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type AccountCreationAttributes = Optional<AccountAttributes, AccountOptionalAttributes>;

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
    public acctId!: number;
    public email!: string;
    public passwordHash!: string;
    public isVerified!: boolean;
    public verificationToken!: string;
    public updated!: number;
    public role!: string;
    public passwordReset!: number;
    public isBanned!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: S): typeof Account {
        return Account.init(
            {
                acctId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
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
                updated: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                role: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                passwordReset: {
                    type: DataTypes.BIGINT,
                    allowNull: true,
                },
                isBanned: {
                    type: DataTypes.BOOLEAN,
                    allowNull: true,
                },
            },
            {
                timestamps: true,
                sequelize: sequelize,
                paranoid: false,
            },
        );
    }
}
