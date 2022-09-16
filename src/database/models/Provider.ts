import {
    Association,
    DataTypes,
    Model,
    Optional,
    Sequelize,
    HasManyGetAssociationsMixin,
    HasManySetAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyRemoveAssociationMixin,
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyRemoveAssociationsMixin,
    HasManyCountAssociationsMixin,
} from "sequelize";

import sequelizeConnection from "../Database";
import { Task, TaskId } from "./Task";

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

export type ProviderId = "id";
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

    // Provider hasMany Task via ProviderId
    task!: Task;
    getProvider_tasks!: HasManyGetAssociationsMixin<Task>;
    setProvider_tasks!: HasManySetAssociationsMixin<Task, TaskId>;
    addProvider_task!: HasManyAddAssociationMixin<Task, TaskId>;
    addProvider_tasks!: HasManyAddAssociationsMixin<Task, TaskId>;
    createProvider_tasks!: HasManyCreateAssociationMixin<Task>;
    removeProvider_task!: HasManyRemoveAssociationMixin<Task, TaskId>;
    removeProvider_tasks!: HasManyRemoveAssociationsMixin<Task, TaskId>;
    hasProvider_task!: HasManyAddAssociationMixin<Task, TaskId>;
    hasProvider_tasks!: HasManyAddAssociationsMixin<Task, TaskId>;
    countProvider_tasks!: HasManyCountAssociationsMixin;

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
