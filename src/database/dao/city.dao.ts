import { City, CityCreationAttributes } from "../models/City";

class CityDAO {
    constructor() {}

    public getMultipleCities = (limit: number, offset?: number) => {
        return City.findAndCountAll({ offset, limit });
    };

    public getCityById = (id: number) => {
        return City.findByPk(id);
    };

    public getCityByName = (name: string) => {
        return City.findOne({
            where: {
                city: name,
            },
        });
    };

    public createCity = (city: CityCreationAttributes) => {
        return City.create(city);
    };

    public updateCity = (city: CityCreationAttributes, id: number) => {
        return City.update(city, { where: { cityId: id } });
    };

    public deleteCity = (id: number) => {
        return City.destroy({ where: { cityId: id } });
    };
}

export default CityDAO;
