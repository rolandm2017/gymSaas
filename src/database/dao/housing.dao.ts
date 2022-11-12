import { off } from "process";
import { Housing, HousingCreationAttributes } from "../models/Housing";
import CityDAO from "./city.dao";
import StateDAO from "./state.dao";

class HousingDAO {
    private stateDAO: StateDAO;
    private cityDAO: CityDAO;

    constructor(stateDAO: StateDAO, cityDAO: CityDAO) {
        this.stateDAO = stateDAO;
        this.cityDAO = cityDAO;
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

    public getAllHousing = async (cityId?: number, cityName?: string, stateOrProvince?: string) => {
        let conditions;
        let state;
        if (stateOrProvince) {
            state = await this.stateDAO.getStateByName(stateOrProvince);
            if (state === null || undefined) return [];
        }
        if (cityId && stateOrProvince) {
            if (!state) return [];
            conditions = { cityId, stateId: state.stateId };
        } else if (cityName && stateOrProvince) {
            const city = await this.cityDAO.getCityByName(cityName);
            if (city === null) return [];
            if (!state) return [];
            conditions = { cityId: city.cityId, stateId: state.stateId };
        } else if (stateOrProvince) {
            if (!state) return [];
            conditions = { stateId: state.stateId };
        } else if (cityId) {
            conditions = { cityId };
        } else {
            throw new Error("You need to supply arguments");
        }
        return await Housing.findAll({ where: conditions });
    };

    public getHousingByCityIdAndBatchNum = async (cityId: number, batchNum: number) => {
        return await Housing.findAll({ where: { cityId, batchId: batchNum } });
    };

    public updateHousing = (housing: HousingCreationAttributes, housingId: number) => {
        return Housing.update(housing, { where: { housingId } });
    };

    public deleteHousing = (housingId: number) => {
        return Housing.destroy({ where: { housingId } });
    };
}

export default HousingDAO;
