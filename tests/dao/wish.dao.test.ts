import CityDAO from "../../src/database/dao/city.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import StateDAO from "../../src/database/dao/state.dao";
import AccountDAO from "../../src/database/dao/account.dao";
import FeedbackDAO from "../../src/database/dao/feedback.dao";
import GymDAO from "../../src/database/dao/gym.dao";
import WishDAO from "../../src/database/dao/wish.dao";
import ProfileDAO from "../../src/database/dao/profile.dao";

import { app } from "../mocks/mockServer";

const cityDAO: CityDAO = new CityDAO();

const stateDAO: StateDAO = new StateDAO();

const wishDAO = new WishDAO();
const profileDAO = new ProfileDAO();

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("wish");
    await app.dropTable("profile");
});

afterAll(async () => {
    await app.closeDB();
});

describe("wish DAO", () => {
    test("create a wish", async () => {
        // arrange
        const testIp = "22.44.55.66";
        const profile = await profileDAO.createProfileByIp(testIp);
        // act
        const wishLocation = "Whistler";
        const wish = await wishDAO.createWish({ wishLocation, profileId: profile.profileId });
        // assert
        expect(wish.wishLocation).toBe(wishLocation);
        expect(wish.profileId).toBe(profile.profileId);
    });
    test("get all wishes for profile", async () => {
        const testIpOne = "12.12.12.12";
        const profile = await profileDAO.createProfileByIp(testIpOne);
        await wishDAO.createWish({ wishLocation: "Kelowna", profileId: profile.profileId });
        await wishDAO.createWish({ wishLocation: "Kamloops", profileId: profile.profileId });
        await wishDAO.createWish({ wishLocation: "Revelstoke", profileId: profile.profileId });
        await wishDAO.createWish({ wishLocation: "Salmon Arm", profileId: profile.profileId });
        // act
        const byProfileId = await wishDAO.getAllWishesForProfile(profile.profileId);
        // assert
        expect(byProfileId.length).toBe(4);
    });
    test("get all wishes", async () => {
        // arrange
        const testIpOne = "1.1.1.1";
        const testIpTwo = "2.2.2.2";
        const testIpThree = "4.4.4.4";
        const profileOne = await profileDAO.createProfileByIp(testIpOne);
        const profileTwo = await profileDAO.createProfileByIp(testIpTwo);
        const profileThree = await profileDAO.createProfileByIp(testIpThree);
        await wishDAO.createWish({ wishLocation: "New Delhi", profileId: profileOne.profileId });
        await wishDAO.createWish({ wishLocation: "New York", profileId: profileTwo.profileId });
        await wishDAO.createWish({ wishLocation: "York", profileId: profileThree.profileId });
        await wishDAO.createWish({ wishLocation: "London", profileId: profileThree.profileId });
        await wishDAO.createWish({ wishLocation: "Paris", profileId: profileThree.profileId });
        // act
        const all = await wishDAO.getAllWishes();
        // assert
        expect(all.length).toBeGreaterThanOrEqual(5);
    });
});
