import { DataTypes, Model, Sequelize, Optional, ForeignKey, Association, HasManyGetAssociationsMixin, HasManyAddAssociationMixin } from "sequelize";
import { Batch } from "./Batch";
import { City } from "./City";
import { Profile } from "./Profile";
import { State } from "./State";
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
    nearAGym: boolean | null;
    source: string;
    distanceToNearestGym: number;
    idAtSource: number | null;
    taskId?: number;
    cityId?: number;
    stateId?: number | null;
    batchId?: number;
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
    public nearAGym!: boolean | null;
    public source!: string; // source as in Provider
    public distanceToNearestGym!: number;
    public idAtSource!: number | null;
    public taskId!: ForeignKey<Task["taskId"]>;
    public cityId!: ForeignKey<City["cityId"]>;
    public stateId!: ForeignKey<State["stateId"]>;
    public batchId!: ForeignKey<Batch["batchId"]>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    public readonly Profiles?: Profile[];

    public static associations: {
        Profiles: Association<Housing, Profile>;
    };

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
                    allowNull: true, // because rentCanada won't have it when its entered into the db
                },
                lat: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
                long: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
                nearAGym: {
                    type: DataTypes.BOOLEAN,
                    allowNull: true,
                },
                source: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                distanceToNearestGym: {
                    type: DataTypes.FLOAT,
                    allowNull: true,
                },
                // idAtSource is used to fill out e.g.
                // GET https://www.rentcanada.com/api/listing/38422?includeSharedLocationListings=true
                // which returns a response (duh) with the detail
                //  "listing.url": "/montreal-qc/11666-boulevard-saint-germain/38422",
                // which you put with the domain to form https://www.rentcanada.com/montreal-qc/11666-boulevard-saint-germain/38422
                idAtSource: {
                    type: DataTypes.INTEGER,
                    allowNull: true, // because it only exists on the rentCanada entries
                },
            },
            {
                timestamps: true,
                sequelize: sequelize,
            },
        );
    }
}
