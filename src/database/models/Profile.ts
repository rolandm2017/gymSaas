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
} from "sequelize";
import { Account } from "./Account";
import { Housing } from "./Housing";

// attaches to an account
interface ProfileAttributes {
    //
    profileId?: number;
    accountId?: number; // non optional.
    ipAddress: string;
    pickedHousingIds?: number[];
    pickedGymIds?: number[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type ProfileOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type ProfileCreationAttributes = Optional<ProfileAttributes, ProfileOptionalAttributes>;

export class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> implements ProfileAttributes {
    public profileId!: number;
    public accountId!: ForeignKey<Account["acctId"]>;
    public ipAddress!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    declare getHousings: HasManyGetAssociationsMixin<Housing>;
    declare addHousing: HasManyAddAssociationMixin<Housing, number>;
    declare addHousings: HasManyAddAssociationsMixin<Housing, number>;

    public readonly Housings?: Housing[];

    public static associations: {
        Housings: Association<Profile, Housing>;
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
                    // todo: expand to hold ipaddresses PLURAL because what if user logs in from diff device?
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
