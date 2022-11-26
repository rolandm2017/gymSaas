import { DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { ProviderEnum } from "../../enum/provider.enum";
import { Batch } from "./Batch";
import { City } from "./City";

// import { Provider, ProviderId } from "./Provider";

export interface TaskAttributes {
    taskId?: number;
    providerName: ProviderEnum;
    lat: number;
    long: number;
    zoomWidth: number; // 0 = default
    batch: number;
    lastScan: Date | null;
    cityId?: number;
    batchId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type TaskId = "id";
export type TaskOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type TaskCreationAttributes = Optional<TaskAttributes, TaskOptionalAttributes>;

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
    public taskId?: number;
    public providerName!: ProviderEnum;
    public lat!: number;
    public long!: number;
    public zoomWidth!: number;
    public batch!: number;
    public lastScan!: Date | null;
    public cityId!: ForeignKey<City["cityId"]>;
    public batchId!: ForeignKey<Batch["batchId"]>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Task {
        return Task.init(
            {
                taskId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                providerName: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                lat: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
                long: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
                zoomWidth: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                batch: {
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
                sequelize: sequelize,
            },
        );
    }
}
