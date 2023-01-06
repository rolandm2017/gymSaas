import WishDAO from "../database/dao/wish.dao";

class WishService {
    private wishDAO: WishDAO;
    constructor(wishDAO: WishDAO) {
        //
        this.wishDAO = wishDAO;
    }

    public async createWish(wishLocation: string, acctId: number) {
        return await this.wishDAO.createWish(wishLocation, acctId);
    }

    public async getAllWishesForAccount(acctId: number) {
        return await this.wishDAO.getAllWishesForAccount(acctId);
    }

    public async getAllWishes() {
        return await this.wishDAO.getAllWishes();
    }
}

export default WishService;
