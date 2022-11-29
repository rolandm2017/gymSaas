import { City } from "../models/City";
import { Housing, HousingCreationAttributes } from "../models/Housing";
import { State } from "../models/State";
import CityDAO from "./city.dao";
import StateDAO from "./state.dao";

// interface FindApartmentsByLocationFilters {
//     cityName?: string;
//     stateName?: string;
// }
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
        if ([cityId, cityName, stateOrProvince].every(arg => arg === undefined)) return await Housing.findAll({});
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

    public getApartmentsByLocation = async (cityName: string | undefined) => {
        const city: City | null = cityName ? await this.cityDAO.getCityByName(cityName) : null;
        // const state: State | null = stateName ? await this.stateDAO.getStateByName(stateName) : null; // yagni
        console.log(city?.cityId, "67rm");
        if (city === null) return [];
        // if (state === null && city === null) return [];
        // if (city && state === null) return await Housing.findAll({ where: { cityId: city.cityId } });
        // if (city === null && state) return await Housing.findAll({ where: { stateId: state.stateId } });
        // if (city === null || state === null) return []; // appeasing typescript, neither is null at this point
        return await Housing.findAll({ where: { cityId: city.cityId } });
    };

    public updateHousing = (housing: HousingCreationAttributes, housingId: number) => {
        return Housing.update(housing, { where: { housingId } });
    };

    public deleteHousing = (housingId: number) => {
        return Housing.destroy({ where: { housingId } });
    };
}

export default HousingDAO;
