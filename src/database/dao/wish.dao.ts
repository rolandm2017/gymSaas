import { Profile } from "../models/Profile";
import { Wish, WishCreationAttributes } from "../models/Wish";
import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class WishDAO {
    constructor() {}
    //

    public async createWish(wish: WishCreationAttributes): Promise<Wish> {
        return await Wish.create(wish);
    }

    public async getAllWishesForProfile(profileId: number): Promise<Wish[]> {
        return await Wish.findAll({ include: { required: true, model: Profile, where: { profileId } } });
    }

    public async getAllWishes(): Promise<Wish[]> {
        return await Wish.findAll({});
    }
}

export default WishDAO;
