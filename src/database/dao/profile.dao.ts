import { start } from "repl";
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

    public recordPublicPickGym = async (ipAddress: string, gymId: number) => {
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
            created.addGym(gym);
            return created.save();
        } else {
            // if ip addr is previously seen, update their housing ids
            const profile = profiles[0];
            profile.addGym(gym);
            return profile.save();
        }
    };

    public getAllPicks = async (acctId: number) => {
        const profile = await Profile.findOne({ where: { accountId: acctId } });
        if (profile === null) {
            throw new Error("Profile not found for this account id");
        }
        return profile.getHousings();
    };
}

export default ProfileDAO;
