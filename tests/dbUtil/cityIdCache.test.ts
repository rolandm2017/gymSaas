import { getCityIdFromCacheElseDb, setCityId, _cityIdCache } from "../../src/database/cache/cityIdCache";

describe("test the city id cache", () => {
    test("we can set the city id into the cache", () => {
        //
        setCityId("vancouver", 3);
        expect(_cityIdCache.get("vancouver")).toBe(3);
    });
    test("we can get the city id from the cache without touching the db", async () => {
        // Note: this test depends on the one before it ...
        const fakeCityDAO = {
            getCityByName: jest.fn(),
            getMultipleCities: jest.fn(),
            getCityById: jest.fn(),
            createCity: jest.fn(),
            updateCity: jest.fn(),
            deleteCity: jest.fn(),
            getAllCities: jest.fn(),
        };
        const cityId = await getCityIdFromCacheElseDb("vancouver", fakeCityDAO);
        expect(cityId).toBe(3);
        expect(fakeCityDAO.getCityByName).not.toHaveBeenCalled();
    });
});
