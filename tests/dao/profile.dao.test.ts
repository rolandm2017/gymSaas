import CityDAO from "../../src/database/dao/city.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import StateDAO from "../../src/database/dao/state.dao";
import { CityCreationAttributes } from "../../src/database/models/City";
import ProfileDAO from "../../src/database/dao/profile.dao";
import { HousingCreationAttributes } from "../../src/database/models/Housing";
import { Profile } from "../../src/database/models/Profile";
import { AgreementTypeEnum } from "../../src/enum/agreementType.enum";
import { BuildingTypeEnum } from "../../src/enum/buildingType.enum";
import { ProviderEnum } from "../../src/enum/provider.enum";

import { FAKE_ACCOUNT } from "../mocks/userCredentials";

import AccountDAO from "../../src/database/dao/account.dao";
import { dummyGymData } from "../mocks/dummyGyms/dummyGyms";
import GymDAO from "../../src/database/dao/gym.dao";
import { app } from "../mocks/mockServer";

const cityDAO: CityDAO = new CityDAO();
const activeAcctDAO: AccountDAO = new AccountDAO();

const stateDAO: StateDAO = new StateDAO();
const housingDAO = new HousingDAO(stateDAO, cityDAO);
const profileDAO = new ProfileDAO();
const gymDAO = new GymDAO();

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
        price: 100,
        address: "33 cats street",
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
        price: 100,
        address: "33 cats street",
        url: "google.ca",
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
        address: "33 cats street",
        url: "google.ca",
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
    test("create profile by ip", async () => {
        const ipForTest = "127.0.0.1";
        const profile = await profileDAO.createProfileByIp(ipForTest);
        expect(profile.ipAddress).toBe(ipForTest);
        expect(profile.profileId).toBeDefined();
    });
    test("get profile by account id", async () => {
        // arrange
        const createdAccount = await activeAcctDAO.createAccount(FAKE_ACCOUNT);
        const ipAddr = "5.5.5.5";
        const createdProfile = await profileDAO.createProfileByIp(ipAddr);
        const updated = await profileDAO.associateAccountWithProfile(createdProfile, createdAccount.acctId);
        // act
        const retrieved = await profileDAO.getProfileForAccountId(createdAccount.acctId);
        // assert
        expect(retrieved?.ipAddress).toBe(createdProfile.ipAddress);
    });
    test("record public pick housing", async () => {
        // if the ip's profile already exists, the housing is added.
        const ipForTestOne = "125.9.9.2";
        const created = await profileDAO.createProfileByIp(ipForTestOne);
        const withHousing = await profileDAO.recordPublicPickHousing(ipForTestOne, apIdOne);
        // if the ip's profile doesnt already exist, one is created, and then the housing is added.
        const newIp = "150.44.44.3";
        const withHousingTwo = await profileDAO.recordPublicPickHousing(newIp, apIdTwo);
        // assert
        const allHousingPicks = await profileDAO.getAllHousingPicksByProfileId(created.profileId);
        const allHousingPicksTwo = await profileDAO.getAllHousingPicksByProfileId(withHousingTwo.profileId);
        expect(allHousingPicks.length).toBe(1);
        expect(allHousingPicksTwo.length).toBe(1);
    });

    test("record public pick gym", async () => {
        const gyms = await gymDAO.getAllGyms();
        expect(gyms.length).toBeGreaterThanOrEqual(2); // test inputs.
        const ipForTestOne = "125.9.9.22";
        const created = await profileDAO.createProfileByIp(ipForTestOne);
        const newIp = "150.44.44.32";
        // act
        // if the ip's profile already exists, the housing is added.
        const withGyms = await profileDAO.recordPublicPickGym(ipForTestOne, gyms[0].gymId);
        // if the ip's profile doesnt already exist, one is created, and then the gym is added.
        const withGymsTwo = await profileDAO.recordPublicPickGym(newIp, gyms[1].gymId);
        // assert
        const gymPicks = await profileDAO.getAllGymPicksByProfileId(created.profileId);
        const gymPicksTwo = await profileDAO.getAllGymPicksByProfileId(withGymsTwo.profileId);
        expect(gymPicks.length).toBe(1);
        expect(gymPicksTwo.length).toBe(1);
    });
});
