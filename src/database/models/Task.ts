import { Association, DataTypes, Model, Optional, Sequelize } from "sequelize";

import sequelizeConnection from "../Database";

export interface TaskAttributes {
    id?: number;
    lat: number;
    long: number;
    zoomWidth: number;
    lastScan: Date | undefined;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type TaskOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type TaskCreationAttributes = Optional<TaskAttributes, TaskOptionalAttributes>;

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
    public id!: number;
    public lat!: number;
    public long!: number;
    public zoomWidth!: number;
    public lastScan: Date | undefined;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Task {
        return Task.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                lat: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                long: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                zoomWidth: {
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
