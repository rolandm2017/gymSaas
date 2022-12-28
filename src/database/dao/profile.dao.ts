import { start } from "repl";
import { Housing } from "../models/Housing";
import { Profile, ProfileCreationAttributes } from "../models/Profile";

class ProfileDAO {
    constructor() {}
    //

    public createProfileByIp = async (startValue: ProfileCreationAttributes): Promise<Profile> => {
        return await Profile.create(startValue);
    };

    public recordPickPublic = async (ipAddress: string, housingId: number) => {
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

    public getAllPicks = async (acctId: number) => {
        const profile = await Profile.findOne({ where: { accountId: acctId } });
        if (profile === null) {
            throw new Error("Profile not found for this account id");
        }
        return profile.getHousings();
    };
}

export default ProfileDAO;
