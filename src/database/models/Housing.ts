import { DataTypes, Model, Sequelize, Optional, ForeignKey } from "sequelize";

import sequelizeConnection from "../Database";
import { City } from "./City";

interface HousingAttributes {
    housingId?: number;
    buildingType: "apartment" | "house";
    agreementType: "rent" | "buy";
    price: number;
    address: string;
    url: string;
    lat: number;
    long: number;
    cityId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}
// export interface HousingInput extends Required<HousingAttributes> {}
// export interface HousingOutput extends Required<HousingAttributes> {}

export type HousingOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type HousingCreationAttributes = Optional<HousingAttributes, HousingOptionalAttributes>;

export class Housing extends Model<HousingAttributes, HousingCreationAttributes> implements HousingAttributes {
    public housingId!: number;
    public buildingType!: "apartment" | "house";
    public agreementType!: "rent" | "buy";
    public price!: number;
    public address!: string;
    public url!: string;
    public lat!: number;
    public long!: number;
    public cityId!: ForeignKey<City["cityId"]>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Housing {
        return Housing.init(
            {
                housingId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                buildingType: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                agreementType: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                price: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },

                address: {
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
