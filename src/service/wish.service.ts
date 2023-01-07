import ProfileDAO from "../database/dao/profile.dao";
import WishDAO from "../database/dao/wish.dao";
import { Wish } from "../database/models/Wish";

class WishService {
    private wishDAO: WishDAO;
    private profileDAO: ProfileDAO;
    constructor(wishDAO: WishDAO, profileDAO: ProfileDAO) {
        //
        this.wishDAO = wishDAO;
        this.profileDAO = profileDAO;
    }

    public async createWish(wishLocation: string, acctId: number): Promise<Wish> {
        const profile = await this.profileDAO.getProfileForAccountId(acctId);
        const noProfileFound = profile === null;
        if (noProfileFound) {
            throw Error("No profile found for this account");
        }
        return await this.wishDAO.createWish({ wishLocation, profileId: profile.profileId });
    }

    public async getAllWishesForAccount(acctId: number): Promise<Wish[]> {
        const profile = await this.profileDAO.getProfileForAccountId(acctId);
        const noProfileFound = profile === null;
        if (noProfileFound) {
            throw Error("No profile found for this account");
        }
        return await this.wishDAO.getAllWishesForProfile(profile.profileId);
    }

    public async getAllWishes(): Promise<Wish[]> {
        return await this.wishDAO.getAllWishes();
    }
}

export default WishService;
