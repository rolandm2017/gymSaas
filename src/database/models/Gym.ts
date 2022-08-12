import { Association, DataTypes, Model, Optional, Sequelize } from "sequelize";

import sequelizeConnection from "../Database";

// import { LocationAttributes } from "./Location";

export interface GymAttributes {
    id?: number;
    city: string;
    street: string; // street address, e.g. 123 Fake St, 596 Unreal Boulevard
    // FIXME: street => streetAddr
    country: string;
    url: string; // link to the biz's website
    lat: number;
    long: number;
    icon?: string;
    name: string; // business name
    rating?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
// export interface GymInput extends Required<GymAttributes> {}
// export interface GymOutput extends Required<GymAttributes> {}

export type GymOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type GymCreationAttributes = Optional<GymAttributes, GymOptionalAttributes>;

export class Gym extends Model<GymAttributes, GymCreationAttributes> implements GymAttributes {
    public id!: number;
    public city!: string;
    public street!: string;
    public country!: string;
    public url!: string;
    public lat!: number;
    public long!: number;
    public icon?: string;
    public name!: string;
    public rating?: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Gym {
        return Gym.init(
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
                street: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                country: { type: DataTypes.STRING, allowNull: false },
                url: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                lat: {
                    type: DataTypes.FLOAT,
                    allowNull: false,
                },
                long: {
                    type: DataTypes.FLOAT,
                    allowNull: false,
                },
                icon: { type: DataTypes.STRING, allowNull: true },
                name: { type: DataTypes.STRING, allowNull: false },
                rating: { type: DataTypes.FLOAT, allowNull: true },
            },
            {
                timestamps: true,
                sequelize: sequelizeConnection,
                paranoid: true,
            },
        );
    }
}
