import { City, CityCreationAttributes } from "../models/City";

class CityDAO {
    constructor() {}

    public createCity = async (city: CityCreationAttributes): Promise<City> => {
        try {
            return await City.create(city);
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getAllCities = async (): Promise<City[]> => {
        return await City.findAll({});
    };

    public getMultipleCities = async (limit: number, offset?: number): Promise<{ rows: City[]; count: number }> => {
        return await City.findAndCountAll({ offset, limit });
    };

    public getCityById = async (id: number): Promise<City | null> => {
        return await City.findByPk(id);
    };

    public getCityByName = async (cityName: string): Promise<City | null> => {
        return await City.findOne({
            where: {
                cityName: cityName,
            },
        });
    };

    public updateCity = async (city: CityCreationAttributes, id: number): Promise<number> => {
        const affected = await City.update(city, { where: { cityId: id } });
        return affected[0];
    };

    public deleteCity = async (id: number): Promise<number> => {
        return await City.destroy({ where: { cityId: id } });
    };
}

export default CityDAO;
