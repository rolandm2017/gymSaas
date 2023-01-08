import { DataTypes, Sequelize as S, Model, Optional, ForeignKey, HasOneSetAssociationMixin, HasOneGetAssociationMixin } from "sequelize";
import { Profile } from "./Profile";

interface AccountAttributes {
    acctId?: number;
    email: string;
    passwordHash: string;
    isVerified: boolean | null;
    verificationToken: string | null;
    updated: number | null;
    role: string;
    passwordReset: number | null; // Date.now()
    isBanned?: boolean | null;
    googleId: string | null;
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
    public isVerified!: boolean | null;
    public verificationToken!: string | null;
    public updated!: number | null; // todo: remove this. 'updatedAt' handles it
    public role!: string;
    public passwordReset!: number;
    public isBanned!: boolean;
    public googleId!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    declare getProfile: HasOneGetAssociationMixin<Profile>;
    declare setProfile: HasOneSetAssociationMixin<Profile, number>;

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
                googleId: {
                    type: DataTypes.STRING,
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
