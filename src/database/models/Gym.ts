import { Association, DataTypes, Model, Optional, Sequelize } from "sequelize";

import sequelizeConnection from "../Database";

// import { LocationAttributes } from "./Location";

interface GymAttributes {
    id: number;
    city: string;
    street: string;
    url: string;
    lat: number;
    long: number;
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
    public url!: string;
    public lat!: number;
    public long!: number;

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
            },
            {
                timestamps: true,
                sequelize: sequelizeConnection,
                paranoid: true,
            },
        );
    }
}
