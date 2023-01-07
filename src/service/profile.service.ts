import AccountDAO from "../database/dao/account.dao";
import GymDAO from "../database/dao/gym.dao";
import HousingDAO from "../database/dao/housing.dao";
import ProfileDAO from "../database/dao/profile.dao";
import { Gym } from "../database/models/Gym";
import { Housing } from "../database/models/Housing";
import { Profile } from "../database/models/Profile";

class ProfileService {
    private profileDAO: ProfileDAO;
    private accountDAO: AccountDAO;
    private housingDAO: HousingDAO;
    private gymDAO: GymDAO;
    constructor(profileDAO: ProfileDAO, accountDAO: AccountDAO, housingDAO: HousingDAO, gymDAO: GymDAO) {
        //
        this.profileDAO = profileDAO;
        this.accountDAO = accountDAO;
        this.housingDAO = housingDAO;
        this.gymDAO = gymDAO;
    }

    public async recordPublicPickHousing(ipAddress: string, housingId: number): Promise<Profile> {
        const housing = await this.housingDAO.getHousingByHousingId(housingId);
        if (housing === null) {
            throw Error("No housing found");
        }
        return await this.profileDAO.recordPublicPickHousing(ipAddress, housing);
    }

    public async recordPublicPickGym(ipAddress: string, gymId: number): Promise<Profile> {
        const gym = await this.gymDAO.getGymByGymId(gymId);
        if (gym === null) {
            throw Error("No gym found");
        }
        return await this.profileDAO.recordPublicPickGym(ipAddress, gym);
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

    public async associateProfileWithAccount(accountId: number, ipAddress: string): Promise<Profile> {
        const account = await this.accountDAO.getAccountByAccountId(accountId);
        if (account === null) {
            throw Error("No account found");
        }
        const profile = await this.profileDAO.getProfileByIp(ipAddress);
        const noProfileFound = profile === null;
        if (noProfileFound) {
            // create one
            const profile = await this.profileDAO.createProfileByIp(ipAddress);
            return await this.profileDAO.associateProfileWithAccount(profile.profileId, account);
        }
        profile.acctId = accountId;
        return await this.profileDAO.associateProfileWithAccount(profile.profileId, account);
    }
}

export default ProfileService;
