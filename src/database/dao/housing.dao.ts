import { off } from "process";
import { Housing, HousingCreationAttributes } from "../models/Housing";

class HousingDAO {
    constructor() {}
    public getMultipleHousings = async (limit?: number, offset?: number) => {
        if (limit === undefined && offset === undefined) return await Housing.findAndCountAll({ where: {} });
        return await Housing.findAndCountAll({ offset, limit });
    };

    public getHousingById = (id: number) => {
        return Housing.findByPk(id);
    };

    public createHousing = (housing: HousingCreationAttributes) => {
        return Housing.create({ ...housing });
    };

    public updateHousing = (housing: HousingCreationAttributes, housingId: number) => {
        return Housing.update(housing, { where: { housingId } });
    };

    public deleteHousing = (housingId: number) => {
        return Housing.destroy({ where: { housingId } });
    };
}

export default HousingDAO;
