import { start } from "repl";
import { Account } from "../models/Account";
import { Gym } from "../models/Gym";
import { Housing } from "../models/Housing";
import { Profile, ProfileCreationAttributes } from "../models/Profile";

class ProfileDAO {
    constructor() {}
    //

    public async createProfileByIp(ipAddress: string): Promise<Profile> {
        return await Profile.create({ ipAddress });
    }

    public async recordPublicPickHousing(ipAddress: string, housingId: number) {
        const profiles = await Profile.findAll({ where: { ipAddress } });
        const noneFound = profiles.length === 0;
        const housing = await Housing.findByPk(housingId);
        const housingNotFound = housing == null;
        if (housingNotFound) {
            throw new Error("No housing found for this id");
        }
        // if ip addr is new, create a profile;
        if (noneFound) {
            const created = await Profile.create({ ipAddress });
            created.addHousing(housing);
            return created.save();
        } else {
            // if ip addr is previously seen, update their housing ids
            const profile = profiles[0];
            profile.addHousing(housing);
            return profile.save();
        }
    }

    public async getProfileForAccountId(accountId: number): Promise<Profile | null> {
        return await Profile.findOne({ where: { accountId } });
    }

    public async recordPublicPickGym(ipAddress: string, gymId: number): Promise<Profile> {
        const profiles = await Profile.findAll({ where: { ipAddress } });
        const noneFound = profiles.length === 0;
        const gym = await Gym.findByPk(gymId);
        const gymNotFound = gym == null;
        if (gymNotFound) {
            throw new Error("No gym found for this id");
        }
        // if ip addr is new, create a profile;
        if (noneFound) {
            const created = await Profile.create({ ipAddress });
            console.log(created, "47rm");
            created.addGym(gym);
            created.save();
            return created;
        } else {
            // if ip addr is previously seen, update their housing ids
            const profile = profiles[0];
            console.log(profile, "53rm");
            console.log(profile.addGym, "54rm");
            profile.addGym(gym);
            profile.save();
            return profile;
        }
    }

    public async getAllHousingPicks(acctId: number): Promise<Housing[]> {
        const profile = await Profile.findOne({ include: { required: true, model: Account, where: { acctId } } });

        if (profile === null) {
            throw new Error("Profile not found for this account id");
        }
        return profile.getHousings();
    }

    public async getAllHousingPicksByIp(ip: string): Promise<Housing[]> {
        const profile = await Profile.findOne({ where: { ipAddress: ip }, include: "housing" });
        if (profile === null) {
            throw new Error("Profile not found for this account id");
        }
        return profile.getHousings();
    }

    public async getAllGymPicks(acctId: number): Promise<Gym[]> {
        const profile = await Profile.findOne({ include: { required: true, model: Account, where: { acctId } } });
        // const profile = await Profile.findOne({ where: { accountId: acctId } });
        if (profile === null) {
            throw new Error("Profile not found for this account id");
        }
        return profile.getGyms();
    }

    public async getAllGymPicksByIp(ip: string): Promise<Profile | null> {
        return await Profile.findOne({ where: { ipAddress: ip }, include: "gym" });
    }

    public async getProfileByIp(ipAddress: string): Promise<Profile | null> {
        const profile = await Profile.findOne({ where: { ipAddress } });
        return profile;
    }

    public async associateAccountWithProfile(profile: Profile, accountId: number): Promise<number> {
        const affected = await Profile.update(profile, { where: { accountId } });
        return affected[0];
    }
}

export default ProfileDAO;
