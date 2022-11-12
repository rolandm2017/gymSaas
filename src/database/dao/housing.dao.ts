import { off } from "process";
import { Housing, HousingCreationAttributes } from "../models/Housing";
import StateDAO from "./state.dao";

class HousingDAO {
    private stateDAO: StateDAO;

    constructor(stateDAO: StateDAO) {
        this.stateDAO = stateDAO;
    }

    public createHousing = (housing: HousingCreationAttributes) => {
        return Housing.create({ ...housing });
    };

    public getMultipleHousings = async (limit?: number, offset?: number) => {
        if (limit === undefined && offset === undefined) return await Housing.findAndCountAll({ where: {} });
        return await Housing.findAndCountAll({ offset, limit });
    };

    public getHousingById = (id: number) => {
        return Housing.findByPk(id);
    };

    public getAllHousing = async (cityId: number, stateOrProvince?: string, country?: string) => {
        let conditions;
        if (cityId && stateOrProvince) {
            const state = await this.stateDAO.getStateByName(stateOrProvince);
            if (state === null) return [];
            conditions = { cityId, stateId: state.stateId };
        } else if (stateOrProvince) {
            conditions = { stateId: stateOrProvince };
        } else if (cityId) {
            conditions = { cityId };
        } else {
            throw new Error("You need to supply arguments");
        }
        return await Housing.findAll({ where: conditions });
    };

    public updateHousing = (housing: HousingCreationAttributes, housingId: number) => {
        return Housing.update(housing, { where: { housingId } });
    };

    public deleteHousing = (housingId: number) => {
        return Housing.destroy({ where: { housingId } });
    };
}

export default HousingDAO;
