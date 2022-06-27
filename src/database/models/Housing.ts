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

interface HousingAttributes {
    id: number;
    building: "apartment" | "house";
    transaction: "rent" | "buy";
    price: number;
    city: string;
    street: string;
    url: string;
    lat: number;
    long: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
export interface HousingInput extends Required<HousingAttributes> {}
export interface HousingOutput extends Required<HousingAttributes> {}

export class Housing extends Model<HousingAttributes, HousingInput> implements HousingAttributes {
    public id!: number;
    public building!: "apartment" | "house";
    public transaction!: "rent" | "buy";
    public price!: number;
    public city!: string;
    public street!: string;
    public url!: string;
    public lat!: number;
    public long!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Housing {
        return Housing.init(
            {
                id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                building: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                transaction: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                price: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
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
