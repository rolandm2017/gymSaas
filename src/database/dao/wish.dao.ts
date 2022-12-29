import { start } from "repl";
import { Housing } from "../models/Housing";
import { Wish, WishCreationAttributes } from "../models/Wish";

class WishDAO {
    constructor() {}
    //

    public async createWish(wishLocation: string, acctId: number): Promise<Wish> {
        return await Wish.create(startValue);
    }

    public async getAllWishesForAccount(acctId: number): Promise<Wish[]> {
        return await Wish.findAll({ where: { acctId } });
    }
}

export default WishDAO;
