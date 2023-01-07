// sorry canada

import { Association, DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { Profile } from "./Profile";

export interface WishAttributes {
    wishId?: number;
    wishLocation: string;
    profileId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type WishOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type WishCreationAttributes = Optional<WishAttributes, WishOptionalAttributes>;

export class Wish extends Model<WishAttributes, WishCreationAttributes> implements WishAttributes {
    public wishLocation!: string;
    public profileId!: ForeignKey<Profile["profileId"]>;

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
                wishLocation: {
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
