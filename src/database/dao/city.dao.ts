import { City, CityCreationAttributes } from "../models/City";

export const getMultipleCities = (limit: number, offset?: number) => {
    return City.findAndCountAll({ offset, limit });
};

export const getCityById = (id: number) => {
    return City.findByPk(id);
};

export const createCity = (city: CityCreationAttributes) => {
    return City.create(city);
};

export const updateCity = (city: CityCreationAttributes, id: number) => {
    return City.update(city, { where: { id } });
};

export const deleteCity = (id: number) => {
    return City.destroy({ where: { id } });
};
