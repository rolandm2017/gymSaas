import { City, CityCreationAttributes } from "../models/City";

class CityDAO {
    constructor() {}

    public createCity = (city: CityCreationAttributes) => {
        try {
            return City.create(city);
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    public getAllCities = async () => {
        return await City.findAll({});
    };

    public getMultipleCities = (limit: number, offset?: number) => {
        return City.findAndCountAll({ offset, limit });
    };

    public getCityById = (id: number) => {
        return City.findByPk(id);
    };

    public getCityByName = (cityName: string) => {
        return City.findOne({
            where: {
                cityName: cityName,
            },
        });
    };

    public updateCity = (city: CityCreationAttributes, id: number) => {
        return City.update(city, { where: { cityId: id } });
    };

    public deleteCity = (id: number) => {
        return City.destroy({ where: { cityId: id } });
    };
}

export default CityDAO;
