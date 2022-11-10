import { string } from "joi";
import CityDAO from "./dao/city.dao";

export const _cityIdCache = new Map<string, number>();

// const cityDAO = new CityDAO();

export async function getCityIdFromCacheElseDb(city: string, cityDAO: CityDAO): Promise<number> {
    const idIfExists = _cityIdCache.get(city);
    if (idIfExists) return idIfExists;
    const cityEntry = await cityDAO.getCityByName(city);
    if (cityEntry === null) throw new Error("City not yet defined in db");
    const cityId = cityEntry.cityId;
    _cityIdCache.set(city, cityId);
    return cityId;
}

export async function setCityId(city: string, cityId: number) {
    _cityIdCache.set(city, cityId);
}
