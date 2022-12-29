import { start } from "repl";
import { Account } from "../models/Account";
import { Gym } from "../models/Gym";
import { Housing } from "../models/Housing";
import { Profile, ProfileCreationAttributes } from "../models/Profile";

class ProfileDAO {
    constructor() {}
    //

    public createProfileByIp = async (startValue: ProfileCreationAttributes): Promise<Profile> => {
        return await Profile.create(startValue);
    };

    public recordPublicPickHousing = async (ipAddress: string, housingId: number) => {
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
    };

    public recordPublicPickGym = async (ipAddress: string, gymId: number): Promise<Profile> => {
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
    };

    public getAllHousingPicks = async (acctId: number): Promise<Housing[]> => {
        const profile = await Profile.findOne({ include: { required: true, model: Account, where: { acctId } } });

        if (profile === null) {
            throw new Error("Profile not found for this account id");
        }
        return profile.getHousings();
    };

    public getAllHousingPicksByIp = async (ip: string): Promise<Profile | null> => {
        return await Profile.findOne({ where: { ipAddress: ip }, include: "housing" });
    };

    public getAllGymPicks = async (acctId: number): Promise<Gym[]> => {
        const profile = await Profile.findOne({ include: { required: true, model: Account, where: { acctId } } });
        // const profile = await Profile.findOne({ where: { accountId: acctId } });
        if (profile === null) {
            throw new Error("Profile not found for this account id");
        }
        return profile.getGyms();
    };

    public getAllGymPicksByIp = async (ip: string): Promise<Profile | null> => {
        return await Profile.findOne({ where: { ipAddress: ip }, include: "gym" });
    };
}

export default ProfileDAO;
