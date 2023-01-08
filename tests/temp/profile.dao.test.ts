import CityDAO from "../../src/database/dao/city.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import StateDAO from "../../src/database/dao/state.dao";
import AccountDAO from "../../src/database/dao/account.dao";
import ProfileDAO from "../../src/database/dao/profile.dao";
import GymDAO from "../../src/database/dao/gym.dao";
import { CityCreationAttributes } from "../../src/database/models/City";
import { HousingCreationAttributes } from "../../src/database/models/Housing";
import { Profile } from "../../src/database/models/Profile";
import { AgreementTypeEnum } from "../../src/enum/agreementType.enum";
import { BuildingTypeEnum } from "../../src/enum/buildingType.enum";
import { ProviderEnum } from "../../src/enum/provider.enum";

import { FAKE_ACCOUNT } from "../mocks/userCredentials";

import { dummyGymData } from "../mocks/dummyGyms/dummyGyms";
import { app } from "../mocks/mockServer";

const cityDAO: CityDAO = new CityDAO();
const accountDAO: AccountDAO = new AccountDAO();

const stateDAO: StateDAO = new StateDAO();
const housingDAO = new HousingDAO(stateDAO, cityDAO);
const gymDAO = new GymDAO();
const profileDAO = new ProfileDAO();

let apIdOne: number = 0;
let apIdTwo: number = 0;
let apIdThree: number = 0;

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("profile");
    await app.dropTable("account");
    await app.dropTable("city");
    const cityPayload: CityCreationAttributes = {
        cityName: "montreal",
        country: "canada",
        centerLat: 50,
        centerLong: 50,
        scanRadius: 25,
        lastScan: null,
    };
    const initCity = await cityDAO.createCity(cityPayload);
    if (initCity === undefined) fail("must be defined");
    const ap1: HousingCreationAttributes = {
        buildingType: BuildingTypeEnum.apartment,
        agreementType: AgreementTypeEnum.rent,
        price: 4444,
        address: "44 dog street",
        url: "google.ca",
        lat: 45,
        long: 45,
        nearAGym: null,
        source: ProviderEnum.rentCanada,
        idAtSource: 5,
        cityId: initCity.cityId,
    };
    const ap2: HousingCreationAttributes = {
        buildingType: BuildingTypeEnum.apartment,
        agreementType: AgreementTypeEnum.rent,
        price: 1002,
        address: "33 cats street",
        url: "pets.ca",
        lat: 45,
        long: 45,
        nearAGym: null,
        source: ProviderEnum.rentCanada,
        idAtSource: 6,
        cityId: initCity.cityId,
    };
    const ap3: HousingCreationAttributes = {
        buildingType: BuildingTypeEnum.apartment,
        agreementType: AgreementTypeEnum.rent,
        price: 100,
        address: "22 bird street",
        url: "hotmail.ca",
        lat: 45,
        long: 45,
        nearAGym: null,
        source: ProviderEnum.rentCanada,
        idAtSource: 7,
        cityId: initCity.cityId,
    };
    const ap1made = await housingDAO.createHousing(ap1);
    const ap2made = await housingDAO.createHousing(ap2);
    const ap3made = await housingDAO.createHousing(ap3);
    apIdOne = ap1made.housingId;
    apIdTwo = ap2made.housingId;
    apIdThree = ap3made.housingId;

    for (const gym of dummyGymData) {
        const foundGyms = await gymDAO.getGymByAddress(gym.address);
        if (foundGyms.length > 0) continue; // do not add same gym twice.
        await gymDAO.createGym(gym);
    }
});

afterAll(async () => {
    await app.closeDB();
});

describe("profileDAO tests", () => {
    // test("create profile by ip", async () => {
    //     const ipForTest = "127.0.0.1";
    //     const profile = await profileDAO.createProfileByIp(ipForTest);
    //     expect(profile.ipAddress).toBe(ipForTest);
    //     expect(profile.profileId).toBeDefined();
    // });
    // test("get profile by account id & associateAccountWithProfile", async () => {
    //     // arrange
    //     const createdAccount = await accountDAO.createAccount(FAKE_ACCOUNT);
    //     const ipAddr = "5.5.5.55";
    //     const createdProfile = await profileDAO.createProfileByIp(ipAddr);
    //     const ipAddrTwo = "225.225.225.55";
    //     const createdProfileTwo = await profileDAO.createProfileByIp(ipAddrTwo); // decoy

    //     // update the association
    //     createdProfile.acctId = createdAccount.acctId;

    //     // this tests associateAccountWithProfile!
    //     const updated = await profileDAO.associateProfileWithAccount(createdProfile.profileId, createdAccount);
    //     expect(updated.profileId).toBe(createdProfile.profileId);
    //     expect(updated.acctId).toBe(createdAccount.acctId);
    //     // // act
    //     const retrieved = await profileDAO.getProfileForAccountId(createdAccount.acctId);
    //     // // assert
    //     expect(retrieved?.ipAddress).toBe(createdProfile.ipAddress);
    // });
    test("record public pick housing", async () => {
        // arrange
        const ipForTestOne = "111.111.111.111";
        const newIp = "112.112.112.112";
        const created = await profileDAO.createProfileByIp(ipForTestOne);
        expect(created.profileId).toBeDefined();
        const housingForTestOne = await housingDAO.getHousingByHousingId(apIdOne);
        const housingForTestTwo = await housingDAO.getHousingByHousingId(apIdTwo);
        const housingForBothTests = await housingDAO.getHousingByHousingId(apIdThree);
        if (housingForTestOne === null) throw Error("failed to find housing");
        if (housingForTestTwo === null) throw Error("failed to find housing");
        if (housingForBothTests === null) throw Error("failed to find housing");
        // act
        // if the ip's profile already exists, the housing is added.
        console.log(housingForTestOne.address, housingForTestTwo.address, housingForBothTests.address, "145rm");
        await profileDAO.recordPublicPickHousing(ipForTestOne, housingForTestOne);
        const temp1 = await profileDAO.testGetAllHousings(created.profileId);
        await profileDAO.recordPublicPickHousing(ipForTestOne, housingForTestTwo);
        const temp2 = await profileDAO.testGetAllHousings(created.profileId);
        await profileDAO.recordPublicPickHousing(ipForTestOne, housingForBothTests);
        const temp3 = await profileDAO.testGetAllHousings(created.profileId);
        if (temp1 === null || temp2 === null || temp3 === null) throw Error("hats");
        console.log(temp1.housings ? temp1.housings[0].address : null, "146rm");
        console.log(temp2.housings ? temp2.housings[0].address : null, "149rm");
        console.log(temp3.housings ? temp3.housings[0].address : null, "152rm");
        // if the ip's profile doesnt already exist, one is created, and then the housing is added.
        const secondProfileHousing = await profileDAO.recordPublicPickHousing(newIp, housingForTestOne);
        const secondProfileHousingTwo = await profileDAO.recordPublicPickHousing(newIp, housingForTestTwo);
        const secondProfileHousingThree = await profileDAO.recordPublicPickHousing(newIp, housingForBothTests);
        // console.log(secondProfileHousingThree, "146rm");
        expect(secondProfileHousingThree.profileId).toBeDefined();
        // console.log(created.profileId, "147rm");
        const existingProfileProfileId = created.profileId;
        const existingProfileProfileIdThree = secondProfileHousingThree.profileId;
        expect(existingProfileProfileId).toBeDefined();
        expect(existingProfileProfileIdThree).toBeDefined();
        // assert

        // TEMP TEST
        const all = await profileDAO.testGetAllHousings(existingProfileProfileId);
        // console.log(all, "162rm");
        console.log(
            all!.housings?.map(h => h.address),
            "163rm",
        );
        const housingPicksByProfileId = await profileDAO.getAllHousingPicksByProfileId(existingProfileProfileId);
        const housingPicksByProfileIdTwo = await profileDAO.getAllHousingPicksByProfileId(existingProfileProfileIdThree);
        // console.log(housingPicksByProfileId, housingPicksByProfileId.length, "159rm");
        // console.log(housingPicksByProfileIdTwo, housingPicksByProfileIdTwo.length, "160rm");
        expect(housingPicksByProfileId.length).toBe(3);
        expect(housingPicksByProfileIdTwo.length).toBe(3);
    });

    // test("record public pick gym", async () => {
    //     const gyms = await gymDAO.getAllGyms();
    //     expect(gyms.length).toBeGreaterThanOrEqual(1); // test inputs.
    //     const ipForTestOne = "125.9.9.22";
    //     const created = await profileDAO.createProfileByIp(ipForTestOne);
    //     const newIp = "150.44.44.32";
    //     // act
    //     // if the ip's profile already exists, the housing is added.
    //     const withGyms = await profileDAO.recordPublicPickGym(ipForTestOne, gyms[0]);
    //     // if the ip's profile doesnt already exist, one is created, and then the gym is added.
    //     const withGymsTwo = await profileDAO.recordPublicPickGym(newIp, gyms[0]);
    //     // assert
    //     const gymPicks = await profileDAO.getAllGymPicksByProfileId(created.profileId);
    //     const gymPicksTwo = await profileDAO.getAllGymPicksByProfileId(withGymsTwo.profileId);
    //     expect(gymPicks.length).toBe(1);
    //     expect(gymPicksTwo.length).toBe(1);
    // });
});
