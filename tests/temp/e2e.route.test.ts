import request from "supertest";
import AccountDAO from "../../src/database/dao/account.dao";

import HousingDAO from "../../src/database/dao/housing.dao";
import GymDAO from "../../src/database/dao/gym.dao";
import ProfileDAO from "../../src/database/dao/profile.dao";
import StateDAO from "../../src/database/dao/state.dao";
import CityDAO from "../../src/database/dao/city.dao";
import { HousingCreationAttributes } from "../../src/database/models/Housing";
import { GymCreationAttributes } from "../../src/database/models/Gym";

import { MontrealHousingSeed } from "../../src/seed/housing/Montreal";
import { MontrealGymSeed } from "../../src/seed/gyms/Montreal";
import { emails, passwords } from "../mocks/userCredentials";
import { app, server } from "../mocks/mockServer";
import { IDemoHousing } from "../../src/interface/DemoHousing.interface";
import { IHousing } from "../../src/interface/Housing.interface";
import { FREE_CREDITS } from "../../src/util/constants";
import TaskDAO from "../../src/database/dao/task.dao";
import { ProviderEnum } from "../../src/enum/provider.enum";
import BatchDAO from "../../src/database/dao/batch.dao";

const api = request(server);

const stateDAO = new StateDAO();
const cityDAO = new CityDAO();
let acctDAO: AccountDAO = new AccountDAO();
const housingDAO: HousingDAO = new HousingDAO(stateDAO, cityDAO);
const gymDAO: GymDAO = new GymDAO();
const profileDAO: ProfileDAO = new ProfileDAO();
const batchDAO: BatchDAO = new BatchDAO();
const taskDAO: TaskDAO = new TaskDAO();

const validCredentials = {
    name: "Bobby Fisher",
    email: emails[0],
    password: passwords[0],
    confirmPassword: passwords[0],
    acceptsTerms: true,
};

let latMin = 90; // see prev comment
let latMax = 0; // start w/ 0, the min, so the values always go up
let longMin = 0;
let longMax = -180;

let destinationCityId = 0;

const availableDemoHousingForTest = 15;
const availableGymsForTest = 10;

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("account");
    await app.dropTable("profile");
    await app.dropTable("housing");
    await app.dropTable("gym");
    // populate some fresh data
    // **
    // first we have to ensure the batch ids are in the db!
    await batchDAO.addBatchNum(1);
    // second we have to ensure all the task ids are in the db.
    const taskIds = MontrealHousingSeed.map((h: HousingCreationAttributes) => h.housingId);
    for (const taskId of taskIds) {
        await taskDAO.createTask({ taskId, lat: 0, long: 0, zoomWidth: 0, providerName: ProviderEnum.rentCanada, lastScan: null, ignore: false });
    }
    destinationCityId = MontrealHousingSeed[0].cityId;
    const addedHousingsLat: number[] = [];
    const addedHousingsLong: number[] = [];
    for (let i = 0; i < availableDemoHousingForTest; i++) {
        const housing: HousingCreationAttributes = MontrealHousingSeed[i];
        // record min and max so we can aim the viewport in test
        addedHousingsLat.push(housing.lat);
        addedHousingsLong.push(housing.long);
        await housingDAO.createHousing(housing);
    }
    latMin = Math.min(...addedHousingsLat);
    latMax = Math.max(...addedHousingsLat);
    longMin = Math.min(...addedHousingsLong);
    longMax = Math.max(...addedHousingsLong);
    for (let i = 0; i < availableGymsForTest; i++) {
        const gym: GymCreationAttributes = MontrealGymSeed[i];
        await gymDAO.createGym(gym);
    }
});

afterAll(async () => {
    await app.closeDB();
});

describe("full e2e test", () => {
    test("full e2e test!", async () => {
        // ** **
        // ** **
        // (0) test inputs; confirm everything required is there. 15 apartments, 5 gyms. Use seed data.
        // (1) pick some aps and gyms via ip =>
        // (2) register & authenticate =>
        // (3) view faved aps & gyms => add 3 more of each
        // (4) view updated faves => view the empty 'revealed url' list
        // (5) reveal url 3x => view the updated reveals list => verify credits are deducted
        // (6) "visit" the revealed urls by logging them
        // (7) save two apartments using the Map feature
        // (8) save two apartments using the Search feature
        // ** **
        // ** **

        // *#*
        // *#* (1) pick some aps and gyms via ip
        // *#*
        // arrange
        const publicHousingPath = "/housing/demo";
        // act
        const getDemoHousingResponse = await api.get(publicHousingPath).query({ neLat: latMax, neLong: longMax, swLat: latMin, swLong: longMin });

        const demoHousing = getDemoHousingResponse.body.demoContent;
        expect(demoHousing.length).toBe(availableDemoHousingForTest); // we gathered ALL the data.
        const numOfFavorites = 4;
        const choices = demoHousing.slice(0, numOfFavorites);
        // make picks
        const publicPickHousingPath = "/profile/pick-public/housing";
        for (const choice of choices) {
            expect(choice.housingId).toBeDefined();
            const favoritedResponse = await api.post(publicPickHousingPath).send({ housingId: choice.housingId });
            const msg = favoritedResponse.body.message;
            expect(msg).toBe("Success");
        }
        // assert
        const getFavoritesByIpPath = "/profile/all/picks/housing/by-ip";
        const favoritesByIpResponse = await api.get(getFavoritesByIpPath);
        const favorites = favoritesByIpResponse.body.housingPicks;
        expect(favorites.length).toBe(numOfFavorites);
        const choicesIds = choices.map((h: IDemoHousing) => h.housingId);
        const favoritesIds = favorites.map((h: IHousing) => h.housingId);
        for (let i = 0; i < favoritesIds.length; i++) {
            const favoriteWasInChoices = choicesIds.includes(favoritesIds[i]);
            expect(favoriteWasInChoices).toBe(true);
        }
        // if the tests worked up til now: cool, the public pick route works.

        // *#*
        // *#* (2) register and authenticate
        // *#*
        const authPath = "/auth";

        // first, get the admin account out of the way.
        const adminCredentials = {
            name: "Roland Mackintosh",
            email: "whatever@gmail.com",
            password: "fooFOO4$",
            confirmPassword: "fooFOO4$",
            acceptsTerms: true,
        };
        const adminSignupRes = await api.post(`${authPath}/register`).set("origin", "testSuite").send(adminCredentials);

        // **
        // now register our first real user,
        const credentials = { ...validCredentials };
        const pw = "hatsaregreaT5%";
        credentials.password = pw;
        credentials.confirmPassword = pw;
        const createUserRes = await api.post(`${authPath}/register`).set("origin", "testSuite").send(credentials);
        expect(createUserRes.body.message).toBe("Registration successful, please check your email for verification instructions");
        expect(createUserRes.body.accountDetails.email).toBe(credentials.email);
        expect(createUserRes.body.accountDetails.isVerified).toBe(false);
        // get token via cheater method b/c we don't have email set up => verify ownership of account
        const madeAcct = await acctDAO.getAccountByEmail(credentials.email);
        const token = madeAcct[0].verificationToken;
        const payload = { token: token };
        const acctVerificationRes = await api.post(`${authPath}/verify-email`).send(payload);
        expect(acctVerificationRes.body.message).toBe("Verification successful, you can now login");
        // now we expect logging in with this new account to "just work"
        const loginPayload = { email: credentials.email, password: pw };
        const authenticationRes = await api.post(`${authPath}/authenticate`).send(loginPayload);
        expect(authenticationRes.body.email).toBe(credentials.email);
        expect(authenticationRes.body.acctId).toBeDefined();
        expect(authenticationRes.body.isVerified).toBe(true); // the goods! verification successful.
        expect(authenticationRes.body.credits).toBe(FREE_CREDITS); // because none were used yet.
        expect(authenticationRes.body.name).toBeDefined();
        expect(authenticationRes.body.name).toBe(validCredentials.name); // name exists!
        // check header for jwt and refresh token
        const jwtToken = authenticationRes.body.jwtToken;
        expect(jwtToken).toBeDefined();
        expect(jwtToken.length).toBeGreaterThan(100);
        const refreshToken = authenticationRes.headers["set-cookie"][0];
        const refreshTokenString = refreshToken.split(";")[0].split("=")[1];
        expect(refreshTokenString).toBeDefined();
        expect(refreshTokenString.length).toBe(80);

        // ** Cool, we are now logged in.
        // *#*
        // *#* (3) view faves from pre-authed phase and add 3 more picks

        // "View faves from pre-authed phase"
        // this part of the test will confirm whether or not an account is tied to ip on signup.
        const faveRetrievalRoute = "/profile/all/picks/housing";
        const favesResponse = await api.get(faveRetrievalRoute).set("Authorization", `Bearer ${jwtToken}`);
        const stepThreeFaves = favesResponse.body.housingPicks;
        console.log(stepThreeFaves, "196rm");
        expect(stepThreeFaves.length).toBe(numOfFavorites); // same as the pre-auth picks

        // "Add 3 more picks"
        const availableApsRoute = "/housing/by-location";
        const availableFavoritesRes = await api
            .get(availableApsRoute)
            .set("Authorization", `Bearer ${jwtToken}`)
            .query({ cityId: destinationCityId });
        const availableFavorites: IHousing[] = availableFavoritesRes.body.apartments;
        expect(availableFavorites.length).toBeGreaterThan(3);

        const addFavoriteRoute = "/profile/authed-pick/housing";
        // avoid favoriting the same ap twice
        const stepThreeFavesIds = stepThreeFaves.map((h: IHousing) => h.housingId);
        const furtherFavoritesAdditions = 3;
        let x = furtherFavoritesAdditions;
        for (let i = 0; i < x; i++) {
            const newFavorite = availableFavorites[i];
            if (stepThreeFavesIds.includes(newFavorite.housingId)) {
                x++;
                continue; // invalid choice! do not duplicate addition
            }
            const addedRes = await api.post(addFavoriteRoute).set("Authorization", `Bearer ${jwtToken}`).send({ housingId: newFavorite.housingId });
            const proofOfAdded = addedRes.body.newPickId;
            expect(proofOfAdded).toBeDefined();
            expect(proofOfAdded).toBe(newFavorite.housingId);
        }

        // **
        // (4) view updated faves => view the empty 'revealed url' list
        const favesResponseTwo = await api.get(faveRetrievalRoute).set("Authorization", `Bearer ${jwtToken}`);
        const stepFourFaves = favesResponseTwo.body.housingPicks;
        // ** Now expect 6 items in the favorites list.
        expect(stepFourFaves.length).toBe(numOfFavorites + furtherFavoritesAdditions);

        // view empty 'revealed url' list
        const revealedUrlPath = "/housing/real-url-list";
        const revealedUrlListRes = await api.get(revealedUrlPath).set("Authorization", `Bearer ${jwtToken}`);
        const revealedUrlList = revealedUrlListRes.body.revealedUrls;

        console.log(revealedUrlListRes.body, "236rm");
        expect(revealedUrlList.length).toBe(0); // starting deal

        // **
        // (5) reveal url 3x => view the updated reveals list => verify credits are deducted
        const getRealUrlPath = "/housing/real-url";
        const housingIdsToReveal = stepFourFaves.map((h: IHousing) => h.housingId);
        const revealTargetOne = housingIdsToReveal[0];
        const revealTargetTwo = housingIdsToReveal[1];
        const revealTargetThree = housingIdsToReveal[2];
        const numOfReveals = [revealTargetOne, revealTargetTwo, revealTargetThree].length;
        // act
        const revealResponseOne = await api.get(getRealUrlPath + "/" + revealTargetOne).set("Authorization", `Bearer ${jwtToken}`);
        const revealResponseTwo = await api.get(getRealUrlPath + "/" + revealTargetTwo).set("Authorization", `Bearer ${jwtToken}`);
        const revealResponseThree = await api.get(getRealUrlPath + "/" + revealTargetThree).set("Authorization", `Bearer ${jwtToken}`);
        // apartmentId, realURL,
        const revealedResponsePayloadOne = revealResponseOne.body;
        const revealedResponsePayloadTwo = revealResponseTwo.body;
        const revealedResponsePayloadThree = revealResponseThree.body;
        // assert
        console.log(revealedResponsePayloadOne, "257rm");
        expect(revealedResponsePayloadOne.apartmentId).toBe(revealTargetOne);
        expect(revealedResponsePayloadOne.realURL).toBeDefined();

        console.log(revealedResponsePayloadOne.realURL);
        expect(revealedResponsePayloadTwo.apartmentId).toBe(revealTargetTwo);
        console.log(revealedResponsePayloadTwo.realURL);
        console.log(revealedResponsePayloadThree.realURL);
        expect(revealedResponsePayloadTwo.realURL).toBeDefined();

        expect(revealedResponsePayloadThree.apartmentId).toBe(revealTargetThree);
        expect(revealedResponsePayloadThree.realURL).toBeDefined();

        // View the updated reveals list
        const revealedUrlListResTwo = await api.get(revealedUrlPath).set("Authorization", `Bearer ${jwtToken}`);
        const revealedUrlListTwo = revealedUrlListResTwo.body.revealedUrls;
        expect(revealedUrlListTwo.length).toBe(numOfReveals); // starting deal

        // verify credits were deducted
        const remainingCreditsRoute = "/auth/remaining-credits";
        const remainingCreditsRes = await api.get(remainingCreditsRoute).set("Authorization", `Bearer ${jwtToken}`);
        const remainingCredits = remainingCreditsRes.body.remainingCredits;
        expect(remainingCredits).toBe(FREE_CREDITS - numOfReveals);

        // **
        // (6) "visit" the revealed urls by logging them

        console.log(revealedUrlListTwo);
        revealedUrlListTwo.map((url: string) => {
            expect(url).toBeDefined();
            expect(url.length).toBeGreaterThan(1);
        });
    }, 40000);
});
