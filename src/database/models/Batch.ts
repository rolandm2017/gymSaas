import { DataTypes, Optional, Sequelize as S, Model } from "sequelize";

interface BatchAttributes {
    batchId: number;
    //
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type BatchOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type BatchCreationAttributes = Optional<BatchAttributes, BatchOptionalAttributes>;

export class Batch extends Model<BatchAttributes, BatchCreationAttributes> implements BatchAttributes {
    public batchId!: number;
    //

    static initModel(sequelize: S): typeof Batch {
        return Batch.init(
            {
                batchId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: false,
                    primaryKey: true,
                    unique: true, // no duplicate batch numbers
                },
            },
            {
                timestamps: true,
                sequelize: sequelize,
            },
        );
    }
}
