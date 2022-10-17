import Sequelize, { DataTypes, Sequelize as S, Model, Optional } from "sequelize";

import sequelizeConnection from "../Database";
import { Account, AccountId } from "./Account";

interface RefreshTokenAttributes {
    id?: number;
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

export type RefreshTokenPk = "id";
export type RefreshTokenId = RefreshToken[RefreshTokenPk];

export type RefreshTokenOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type RefreshTokenCreationAttributes = Optional<RefreshTokenAttributes, RefreshTokenOptionalAttributes>;

export class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
    public id!: number;
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

    // RefreshToken belongsTo Account via refresh_token_owner_id <= lying comment probably
    getAccount!: Sequelize.BelongsToGetAssociationMixin<Account>;
    setAccount!: Sequelize.BelongsToSetAssociationMixin<Account, AccountId>;
    createAccount!: Sequelize.BelongsToCreateAssociationMixin<Account>;

    static initModel(sequelize: S): typeof RefreshToken {
        return RefreshToken.init(
            {
                id: {
                    type: DataTypes.INTEGER,
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
