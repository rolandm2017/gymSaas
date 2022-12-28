import { DataTypes, Sequelize as S, Model, Optional, ForeignKey } from "sequelize";
import { Account } from "./Account";
import { Housing } from "./Housing";

// attaches to an account
interface ProfileAttributes {
    //
    accountId: number; // non optional.
    pickedHousingIds?: number[];
    pickedGymIds?: number[];
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export type ProfileOptionalAttributes = "createdAt" | "updatedAt" | "deletedAt";
export type ProfileCreationAttributes = Optional<ProfileAttributes, ProfileOptionalAttributes>;

export class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> implements ProfileAttributes {
    public accountId!: ForeignKey<Account["acctId"]>;
    public pickedHousingIds!: ForeignKey<Housing["housingId"]>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    static initModel(sequelize: S): typeof Profile {
        return Profile.init(
            {},
            {
                timestamps: true,
                sequelize: sequelize,
                paranoid: false,
            },
        );
    }
}
