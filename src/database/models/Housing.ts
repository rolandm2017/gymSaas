import { DataTypes, Model, Sequelize, Optional, ForeignKey } from "sequelize";
import { AgreementTypeEnum } from "../../enum/agreementType.enum";
import { BuildingTypeEnum } from "../../enum/buildingType.enum";

import sequelizeConnection from "../Database";
import { City } from "./City";
import { Task } from "./Task";

interface HousingAttributes {
    housingId?: number;
    buildingType: string; // "apartment" | "house"
    agreementType: string; //"rent" | "buy"
    price: number;
    address: string;
    url: string;
    lat: number;
    long: number;
    taskId?: number;
    cityId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type HousingOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt" | "cityId";
export type HousingCreationAttributes = Optional<HousingAttributes, HousingOptionalAttributes>;

export class Housing extends Model<HousingAttributes, HousingCreationAttributes> implements HousingAttributes {
    public housingId!: number;
    public buildingType!: string;
    public agreementType!: string;
    public price!: number;
    public address!: string;
    public url!: string;
    public lat!: number;
    public long!: number;
    public taskId!: ForeignKey<Task["taskId"]>;
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
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
                long: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
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
