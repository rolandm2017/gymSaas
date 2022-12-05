import { Association, DataTypes, ForeignKey, Model, Optional, Sequelize } from "sequelize";
import { City } from "./City";

export interface GymAttributes {
    gymId?: number;
    cityName: string;
    address: string; // street address, e.g. 123 Fake St, 596 Unreal Boulevard
    url: string; // link to the biz's website
    lat: number;
    long: number;
    icon?: string;
    name: string; // business name
    rating?: number;
    cityId?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type GymOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type GymCreationAttributes = Optional<GymAttributes, GymOptionalAttributes>;

export class Gym extends Model<GymAttributes, GymCreationAttributes> implements GymAttributes {
    public gymId!: number;
    public cityName!: string;
    public address!: string;
    public url!: string;
    public lat!: number;
    public long!: number;
    public icon!: string;
    public name!: string;
    public rating!: number;
    public cityId!: ForeignKey<City["cityId"]>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: Sequelize): typeof Gym {
        return Gym.init(
            {
                gymId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                cityName: {
                    type: DataTypes.STRING,
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
                    unique: true,
                },
                long: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                    unique: true,
                },
                icon: { type: DataTypes.STRING, allowNull: true },
                name: { type: DataTypes.STRING, allowNull: false },
                rating: { type: DataTypes.FLOAT, allowNull: true },
            },
            {
                timestamps: true,
                sequelize: sequelize,
                paranoid: true, // because I don't want to accidentally delete the gyms I paid $ to get from google
            },
        );
    }
}
