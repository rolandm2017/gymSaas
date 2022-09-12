import { Association, DataTypes, Model, Optional, Sequelize } from "sequelize";

import sequelizeConnection from "../Database";

// import { LocationAttributes } from "./Location";

export interface ProviderAttributes {
    id: number;
    city: string;
    state: string;
    country: string;
    centerLat: number;
    centerLong: number;
    lastScan: Date | undefined;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
// export interface ProviderInput extends Required<ProviderAttributes> {}
// export interface ProviderOutput extends Required<ProviderAttributes> {}

export type ProviderOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type ProviderCreationAttributes = Optional<ProviderAttributes, ProviderOptionalAttributes>;

export class Provider extends Model<ProviderAttributes, ProviderCreationAttributes> implements ProviderAttributes {
    public id!: number;
    public city!: string;
    public state!: string;
    public country!: string;
    public centerLat!: number;
    public centerLong!: number;
    public lastScan: Date | undefined;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Provider {
        return Provider.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                city: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                state: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                country: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                centerLat: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                centerLong: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                lastScan: {
                    type: DataTypes.DATE,
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
