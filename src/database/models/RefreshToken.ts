import { DataTypes, Sequelize as S, Model, Optional, ForeignKey } from "sequelize";

import { Account } from "./Account";

interface RefreshTokenAttributes {
    tokenId?: number;
    token: string;
    isActive: boolean;
    expires: Date;
    createdByIp: string;
    revoked?: number | null; // time since utc init represented as # of ms
    revokedByIp?: string | null;
    replacedByToken?: string | null;
    acctId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type RefreshTokenOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt" | "tokenId";
export type RefreshTokenCreationAttributes = Optional<RefreshTokenAttributes, RefreshTokenOptionalAttributes>;

export class RefreshToken extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes> implements RefreshTokenAttributes {
    public tokenId!: number;
    public token!: string;
    public isActive!: boolean;
    public expires!: Date;
    public createdByIp!: string;
    public revoked!: number | null;
    public revokedByIp!: string | null;
    public replacedByToken!: string | null;
    public acctId!: ForeignKey<Account["acctId"]>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: S): typeof RefreshToken {
        return RefreshToken.init(
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
                sequelize: sequelize,
                paranoid: true,
            },
        );
    }
}
