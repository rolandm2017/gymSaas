import ProfileDAO from "../database/dao/profile.dao";
import { Gym } from "../database/models/Gym";
import { Housing } from "../database/models/Housing";
import { Profile } from "../database/models/Profile";

class ProfileService {
    private profileDAO: ProfileDAO;
    constructor(profileDAO: ProfileDAO) {
        //
        this.profileDAO = profileDAO;
    }

    public async recordPublicPickHousing(ipAddress: string, housingId: number): Promise<Profile> {
        return await this.profileDAO.recordPublicPickHousing(ipAddress, housingId);
    }

    public async recordPublicPickGym(ipAddress: string, housingId: number): Promise<Profile> {
        return await this.profileDAO.recordPublicPickGym(ipAddress, housingId);
    }

    public async getAllHousingPicks(acctId: number): Promise<Housing[]> {
        return await this.profileDAO.getAllHousingPicksByAccountId(acctId);
    }

    public async getAllHousingPicksByIp(ipAddr: string): Promise<Housing[]> {
        return await this.profileDAO.getAllHousingPicksByIp(ipAddr);
    }

    public async getAllGymPicks(acctId: number): Promise<Gym[]> {
        return await this.profileDAO.getAllGymPicksByAccountId(acctId);
    }

    public async getAllGymPicksByIp(ipAddr: string): Promise<Profile | null> {
        return await this.profileDAO.getAllGymPicksByIp(ipAddr);
    }

    public async associateAccountWithProfile(accountId: number, ipAddress: string): Promise<number> {
        const profile = await this.profileDAO.getProfileByIp(ipAddress);
        const noProfileFound = profile === null;
        if (noProfileFound) {
            // create one
            const profile = await this.profileDAO.createProfileByIp(ipAddress);
            return await this.profileDAO.associateAccountWithProfile(profile, accountId);
        }
        return await this.profileDAO.associateAccountWithProfile(profile, accountId);
    }
}

export default ProfileService;
