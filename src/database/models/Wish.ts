// sorry canada

import { Association, DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface WishAttributes {
    wishId?: number;
    query: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type WishOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type WishCreationAttributes = Optional<WishAttributes, WishOptionalAttributes>;

export class Wish extends Model<WishAttributes, WishCreationAttributes> implements WishAttributes {
    public query!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Wish {
        return Wish.init(
            {
                wishId: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                },
                query: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
            },
            {
                timestamps: true,
                sequelize: sequelize,
                paranoid: true,
            },
        );
    }
}
