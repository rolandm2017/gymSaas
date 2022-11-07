import { Housing, HousingCreationAttributes } from "../models/Housing";

class HousingDAO {
    constructor() {}
    public getMultipleHousings = (limit: number, offset?: number) => {
        return Housing.findAndCountAll({ offset, limit });
    };

    public getHousingById = (id: number) => {
        return Housing.findByPk(id);
    };

    public createHousing = (housing: HousingCreationAttributes) => {
        return Housing.create(housing);
    };

    public updateHousing = (housing: HousingCreationAttributes, id: number) => {
        return Housing.update(housing, { where: { id } });
    };

    public deleteHousing = (id: number) => {
        return Housing.destroy({ where: { id } });
    };
}

export default HousingDAO;
