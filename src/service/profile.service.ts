import ProfileDAO from "../database/dao/profile.dao";
import WishDAO from "../database/dao/wish.dao";

class ProfileService {
    private profileDAO: ProfileDAO;
    private wishDAO: WishDAO;
    constructor(profileDAO: ProfileDAO, wishDAO: WishDAO) {
        //
        this.profileDAO = profileDAO;
        this.wishDAO = wishDAO;
    }

    public async recordPublicPickHousing(ipAddress: string, housingId: number) {
        // return await this.profileDAO.recordPublicPickHousing(ipAddress, housingId);
    }

    public async recordPublicPickGym(ipAddress: string, housingId: number) {
        return await this.profileDAO.recordPublicPickGym(ipAddress, housingId);
    }

    public async createWish(wishLocation: string, acctId: number) {
        return await this.wishDAO.createWish(wishLocation, acctId);
    }

    public async getAllHousingPicks(acctId: number) {
        return await this.profileDAO.getAllHousingPicks(acctId);
    }

    public async getAllHousingPicksByIp(ipAddr: string) {
        return await this.profileDAO.getAllHousingPicksByIp(ipAddr);
    }

    public async getAllGymPicks(acctId: number) {
        return await this.profileDAO.getAllGymPicks(acctId);
    }

    public async getAllGymPicksByIp(ipAddr: string) {
        return await this.profileDAO.getAllGymPicksByIp(ipAddr);
    }

    public async getAllWishesForAccount(acctId: number) {
        return await this.wishDAO.getAllWishesForAccount(acctId);
    }
}

export default ProfileService;
