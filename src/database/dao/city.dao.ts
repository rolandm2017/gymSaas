import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { City, CityCreationAttributes } from "../models/City";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class CityDAO {
    constructor() {}

    public async createCity(city: CityCreationAttributes): Promise<City> {
        return await City.create(city);
    }

    public async getAllCities(): Promise<City[]> {
        return await City.findAll({});
    }

    public async getMultipleCities(limit: number, offset?: number): Promise<{ rows: City[]; count: number }> {
        return await City.findAndCountAll({ offset, limit });
    }

    public async getCityById(id: number): Promise<City | null> {
        return await City.findByPk(id);
    }

    public async getCityByName(cityName: string): Promise<City | null> {
        return await City.findOne({
            where: {
                cityName: cityName,
            },
        });
    }

    public async updateCity(city: CityCreationAttributes, id: number): Promise<number> {
        const affected = await City.update(city, { where: { cityId: id } });
        return affected[0];
    }

    public async deleteCity(id: number): Promise<number> {
        return await City.destroy({ where: { cityId: id } });
    }
}

export default CityDAO;
