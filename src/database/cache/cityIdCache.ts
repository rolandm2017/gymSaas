import CityDAO from "../dao/city.dao";

export const _cityIdCache = new Map<string, number>();

// const cityDAO = new CityDAO();

export async function getCityIdFromCacheElseDb(cityName: string, cityDAO: CityDAO): Promise<number> {
    const idIfExists = _cityIdCache.get(cityName);
    if (idIfExists) {
        console.log("Used city id cache");
        return idIfExists;
    }
    const cityEntry = await cityDAO.getCityByName(cityName);
    if (cityEntry === null) throw new Error("City not yet defined in db");
    const cityId = cityEntry.cityId;
    _cityIdCache.set(cityName, cityId);
    return cityId;
}

export async function setCityId(cityName: string, cityId: number) {
    _cityIdCache.set(cityName, cityId);
}
