// sorry canada

import { Association, DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface StateAttributes {
    stateId?: number;
    name: string;
    country: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type StateOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type StateCreationAttributes = Optional<StateAttributes, StateOptionalAttributes>;

export class State extends Model<StateAttributes, StateCreationAttributes> implements StateAttributes {
    public stateId!: number;
    public name!: string;
    public country!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof State {
        return State.init(
            {
                stateId: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                country: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                timestamps: true,
                sequelize: sequelize,
            },
        );
    }
}
