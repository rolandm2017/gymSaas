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

    public async recordPickPublic(ipAddress: string, housingId: number) {
        return await this.profileDAO.recordPickPublic(ipAddress, housingId);
    }

    public async createWish(wishLocation: string, acctId: number) {
        return await this.wishDAO.createWish(wishLocation, acctId);
    }

    public async getAllPicks(acctId: number) {
        //
    }

    public async getAllWishesForAccount(acctId: number) {
        return await this.wishDAO.getAllWishesForAccount(acctId);
    }
}

export default ProfileService;
