import { Association, DataTypes, Model, Optional, Sequelize } from "sequelize";

import sequelizeConnection from "../Database";

// import { LocationAttributes } from "./Location";

export interface ProviderAttributes {
    id: number;
    viewportWidth: number;
    scanRadius: number;
    lastScan: Date | undefined;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type ProviderOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type ProviderCreationAttributes = Optional<ProviderAttributes, ProviderOptionalAttributes>;

export class Provider extends Model<ProviderAttributes, ProviderCreationAttributes> implements ProviderAttributes {
    public id!: number;
    public viewportWidth!: number;
    public scanRadius!: number;
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
                viewportWidth: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                scanRadius: {
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
