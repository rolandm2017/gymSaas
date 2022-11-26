import { DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { State } from "./State";

export interface CityAttributes {
    cityId?: number;
    city: string;
    state: string;
    country: string;
    centerLat: number;
    centerLong: number;
    scanRadius: number; // the GTA has a radius of around 25 km.
    stateId?: number;
    lastScan: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type CityOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type CityCreationAttributes = Optional<CityAttributes, CityOptionalAttributes>;

export class City extends Model<CityAttributes, CityCreationAttributes> implements CityAttributes {
    public cityId!: number;
    public city!: string;
    public state!: string;
    public country!: string;
    public centerLat!: number;
    public centerLong!: number;
    public scanRadius!: number;
    public lastScan!: Date | null; // used to distinguish between up to date results and out of date results.
    public stateId?: ForeignKey<State["stateId"]>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof City {
        return City.init(
            {
                cityId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                city: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
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
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
                centerLong: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
                scanRadius: {
                    type: DataTypes.FLOAT,
                    allowNull: false,
                },
                lastScan: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
            {
                timestamps: true,
                sequelize: sequelize,
            },
        );
    }
}
