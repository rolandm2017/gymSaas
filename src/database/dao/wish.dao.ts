import { start } from "repl";
import { Housing } from "../models/Housing";
import { Wish, WishCreationAttributes } from "../models/Wish";

class WishDAO {
    constructor() {}
    //

    public createWish = async (wishLocation: string, acctId: number): Promise<Wish> => {
        return await Wish.create(startValue);
    };

    public getAllWishesForAccount = async (acctId: number): Promise<Wish[]> => {
        return await Wish.findAll({ where: { acctId } });
    };

    public getAllWishes = async (): Promise<Wish[]> => {
        return await Wish.findAll({});
    };
}

export default WishDAO;
