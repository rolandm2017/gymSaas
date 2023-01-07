import {
    DataTypes,
    Sequelize as S,
    Model,
    Optional,
    ForeignKey,
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyGetAssociationsMixin,
    Association,
    HasOneGetAssociationMixin,
    BelongsToCreateAssociationMixin,
    BelongsToGetAssociationMixin,
} from "sequelize";
import { Account } from "./Account";
import { Gym } from "./Gym";
import { Housing } from "./Housing";

// attaches to an account
interface ProfileAttributes {
    profileId?: number;
    acctId?: number;
    ipAddress: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type ProfileOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type ProfileCreationAttributes = Optional<ProfileAttributes, ProfileOptionalAttributes>;

export class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> implements ProfileAttributes {
    public profileId!: number;
    public acctId!: ForeignKey<Account["acctId"]>;
    public ipAddress!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    declare setAccount: BelongsToCreateAssociationMixin<Account>;
    declare getAccount: BelongsToGetAssociationMixin<Account>;

    declare getHousings: HasManyGetAssociationsMixin<Housing>;
    declare addHousing: HasManyAddAssociationMixin<Housing, number>;
    declare addHousings: HasManyAddAssociationsMixin<Housing, number>;

    declare getGyms: HasManyGetAssociationsMixin<Gym>;
    declare addGym: HasManyAddAssociationMixin<Gym, number>;
    declare addGyms: HasManyAddAssociationsMixin<Gym, number>;

    public readonly Housings?: Housing[];
    public readonly Gyms?: Gym[];

    public static associations: {
        Housings: Association<Profile, Housing>;
        Gyms: Association<Profile, Gym>;
    };

    static initModel(sequelize: S): typeof Profile {
        return Profile.init(
            {
                profileId: {
                    type: DataTypes.INTEGER,
                    unique: true,
                    autoIncrement: true,
                    primaryKey: true,
                },
                ipAddress: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                timestamps: true,
                sequelize: sequelize,
                paranoid: false,
            },
        );
    }
}
