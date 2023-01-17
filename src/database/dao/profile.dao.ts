import { Account } from "../models/Account";
import { Gym } from "../models/Gym";
import { Housing } from "../models/Housing";
import { Profile } from "../models/Profile";
import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class ProfileDAO {
    constructor() {}
    //

    public async createProfileByIp(ipAddress: string): Promise<Profile> {
        return await Profile.create({ ipAddress });
    }

    public async recordPublicPickHousing(ipAddress: string, housing: Housing): Promise<Profile> {
        const profiles = await Profile.findAll({ where: { ipAddress } });
        // console.log(profiles, "24rm");
        const noProfilesFound = profiles.length === 0;
        // if ip addr is new, create a profile;
        if (noProfilesFound) {
            const newProfile = await Profile.create({ ipAddress });
            await newProfile.addHousingPicks([housing]);
            return newProfile;
        } else {
            // if ip addr is previously seen, update their housing ids
            const profile = profiles[0];
            await profile.addHousingPicks([housing]);
            return profile;
        }
    }

    public async recordPublicPickGym(ipAddress: string, gym: Gym): Promise<Profile> {
        const profiles = await Profile.findAll({ where: { ipAddress } });
        const noneFound = profiles.length === 0;
        // if ip addr is new, create a profile;
        if (noneFound) {
            const created = await Profile.create({ ipAddress });
            created.addGymPick(gym);
            created.save();
            return created;
        } else {
            // if ip addr is previously seen, update their housing ids
            const profile = profiles[0];
            profile.addGymPick(gym);
            profile.save();
            return profile;
        }
    }

    public async getProfileForAccountId(accountId: number): Promise<Profile | null> {
        return await Profile.findOne({ include: { required: true, model: Account, where: { acctId: accountId }, as: "account" } });
    }

    public async getAllHousingPicksByAccountId(acctId: number): Promise<Housing[]> {
        const profile = await Profile.findOne({ include: { required: true, model: Account, where: { acctId } } });

        if (profile === null) {
            throw new Error("Profile not found for this account id");
        }
        return profile.getHousingPicks();
    }

    public async getAllHousingPicksByIp(ipAddress: string): Promise<Housing[]> {
        const profile = await Profile.findOne({ where: { ipAddress } });
        if (profile === null) {
            throw new Error("Profile not found for this ip address");
        }
        const housings = await profile.getHousingPicks();
        return housings;
    }

    public async testGetAllHousings(profileId: number): Promise<Profile | null> {
        return await Profile.findOne({ where: { profileId }, include: "housings" });
    }

    public async getAllHousingPicksByProfileId(profileId: number): Promise<Housing[]> {
        const profile = await Profile.findOne({ where: { profileId } });
        if (profile === null) {
            throw new Error("Profile not found for this profile id");
        }
        const housings = await profile.getHousingPicks();
        return housings;
    }

    public async getAllGymPicksByAccountId(acctId: number): Promise<Gym[]> {
        const profile = await Profile.findOne({ include: { required: true, model: Account, where: { acctId } } });
        if (profile === null) {
            throw new Error("Profile not found for this account id");
        }
        return profile.getGymPicks();
    }

    public async getAllGymPicksByProfileId(profileId: number): Promise<Gym[]> {
        const profile = await Profile.findOne({ where: { profileId } });
        if (profile === null) {
            throw new Error("Profile not found for this profile id");
        }
        return profile.getGymPicks();
    }

    public async getAllGymPicksByIp(ipAddress: string): Promise<Profile | null> {
        return await Profile.findOne({ where: { ipAddress }, include: "gym" });
    }

    public async getProfileByIp(ipAddress: string): Promise<Profile | null> {
        return await Profile.findOne({ where: { ipAddress } });
    }

    public async getAllProfiles(): Promise<Profile[]> {
        return await Profile.findAll({ include: { model: Account, as: "account" } });
    }

    public async getAccountForProfile(profileId: number): Promise<Profile | null> {
        return await Profile.findOne({ where: { profileId }, include: Account });
    }

    public async associateProfileWithAccount(profileId: number, account: Account): Promise<Profile> {
        const profile = await Profile.findOne({ where: { profileId } });
        if (profile === null) {
            throw new Error("Profile not found for this profile id");
        }
        await profile.setAccount(account);
        return profile;
    }
}

export default ProfileDAO;
