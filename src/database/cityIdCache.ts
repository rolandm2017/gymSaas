import CityDAO from "./dao/city.dao";

export const cityIdCache = new Map<string, number>();

const cityDAO = new CityDAO();

export async function getCityFromCacheElseDb(city: string): Promise<number> {
    const idIfExists = cityIdCache.get(city);
    if (idIfExists) return idIfExists;
    const cityEntry = await cityDAO.getCityByName(city);
    if (cityEntry === null) throw new Error("City not yet defined in db");
    const cityId = cityEntry.cityId;
    cityIdCache.set(city, cityId);
    return cityId;
}
