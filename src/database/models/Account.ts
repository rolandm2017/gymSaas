import Sequelize, { DataTypes, Sequelize as S, Model, Optional } from "sequelize";
import { Role } from "../../enum/role.enum";

import sequelizeConnection from "../Database";
import { RefreshToken, RefreshTokenId } from "./RefreshToken";

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

export type AccountPk = "id";
export type AccountId = Account[AccountPk];

export type AccountOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type AccountCreationAttributes = Optional<AccountAttributes, AccountOptionalAttributes>;

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
    public id!: number;
    public email!: string;
    public passwordHash!: string;
    public isVerified!: boolean;
    public verificationToken!: string;
    public verified!: number; // this is a timestamp
    public updated!: number;
    public role!: string;
    public passwordReset!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    // Account hasMany RefreshTokens via refresh_token_id
    refreshTokens!: RefreshToken[];
    getAccount!: Sequelize.HasManyGetAssociationsMixin<RefreshToken>;
    setRefreshToken!: Sequelize.HasManySetAssociationsMixin<RefreshToken, RefreshTokenId>;
    addRefreshToken!: Sequelize.HasManyAddAssociationMixin<RefreshToken, RefreshTokenId>;
    addRefreshTokens!: Sequelize.HasManyAddAssociationsMixin<RefreshToken, RefreshTokenId>;
    createRefreshToken!: Sequelize.HasManyCreateAssociationMixin<RefreshToken>;
    removeRefreshToken!: Sequelize.HasManyRemoveAssociationMixin<RefreshToken, RefreshTokenId>;
    removeRefreshTokens!: Sequelize.HasManyRemoveAssociationsMixin<RefreshToken, RefreshTokenId>;
    hasRefreshToken!: Sequelize.HasManyHasAssociationMixin<RefreshToken, RefreshTokenId>;
    hasRefreshTokens!: Sequelize.HasManyHasAssociationsMixin<RefreshToken, RefreshTokenId>;
    countRefreshTokens!: Sequelize.HasManyCountAssociationsMixin;

    static initModel(sequelize: S): typeof Account {
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
