import {
    Association,
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManySetAssociationsMixin,
    HasManyAddAssociationsMixin,
    HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    Model,
    ModelDefined,
    Optional,
    Sequelize,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    NonAttribute,
    ForeignKey,
} from "sequelize";

import sequelizeConnection from "../Database";

import { LocationAttributes } from "./Location";

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
export interface GymInput extends Required<GymAttributes> {}
export interface GymOutput extends Required<GymAttributes> {}

export class Gym extends Model<GymAttributes, GymInput> implements GymAttributes {
    public id!: number;
    public city!: string;
    public street!: string;
    public url!: string;
    public lat!: number;
    public long!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Gym {
        return Gym.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
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
