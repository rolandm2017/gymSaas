import { Op } from "sequelize";
import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { City } from "../models/City";
import { Housing, HousingCreationAttributes } from "../models/Housing";
import { State } from "../models/State";
import CityDAO from "./city.dao";
import StateDAO from "./state.dao";

@TryCatchClassDecorator(Error, (err, context) => {
    console.log(context, err);
    throw err;
})
class HousingDAO {
    private stateDAO: StateDAO;
    private cityDAO: CityDAO;

    constructor(stateDAO: StateDAO, cityDAO: CityDAO) {
        this.stateDAO = stateDAO;
        this.cityDAO = cityDAO;
    }

    public createHousing = async (housing: HousingCreationAttributes) => {
        return await Housing.create({ ...housing });
    };

    public countHousingsInCity = async (cityId: number) => {
        return await Housing.count({ where: { cityId } });
    };

    public getMultipleHousings = async (limit?: number, offset?: number): Promise<{ rows: Housing[]; count: number }> => {
        if (limit === undefined && offset === undefined) return await Housing.findAndCountAll({ where: {} });
        return await Housing.findAndCountAll({ offset, limit });
    };

    public getHousingById = async (id: number) => {
        return await Housing.findByPk(id);
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
            conditions = {};
        }
        return await Housing.findAll({ where: conditions });
    };

    public getHousingByCityIdAndBatchNum = async (cityId: number, batchNum: number) => {
        return await Housing.findAll({ where: { cityId, batchId: batchNum } });
    };

    public getApartmentsByLocation = async (cityName: string | undefined) => {
        const city: City | null = cityName ? await this.cityDAO.getCityByName(cityName) : null;
        if (city === null) return [];
        return await Housing.findAll({ where: { cityId: city.cityId } });
    };

    public readBetween = async (lowerLimitLatitude: number, upperLimitLatitude: number, lowerLimitLongitude: number, upperLimitLongitude: number) => {
        return await Housing.findAll({
            where: {
                lat: {
                    [Op.between]: [lowerLimitLatitude, upperLimitLatitude],
                },
                long: {
                    [Op.between]: [lowerLimitLongitude, upperLimitLongitude], // -30, -40
                },
            },
        });
    };

    // update section
    public updateHousing = async (housing: HousingCreationAttributes, housingId: number) => {
        return await Housing.update(housing, { where: { housingId } });
    };

    public markQualified = async (
        cityId: number,
        lowerLimitLatitude: number,
        upperLimitLatitude: number,
        lowerLimitLongitude: number,
        upperLimitLongitude: number,
    ) => {
        return await Housing.update(
            { nearAGym: true }, // "qualified"
            {
                where: {
                    cityId: cityId,
                    lat: {
                        [Op.between]: [lowerLimitLatitude, upperLimitLatitude],
                    },
                    long: {
                        [Op.between]: [lowerLimitLongitude, upperLimitLongitude], // -30, -40
                    },
                    nearAGym: null,
                },
            },
        );
    };

    // delete section
    public deleteUnqualifiedHousingByCityId = async (cityId: number) => {
        return await Housing.destroy({
            where: {
                cityId,
                nearAGym: null,
            },
        });
    };

    public deleteHousingByHousingId = async (housingId: number) => {
        return await Housing.destroy({ where: { housingId } });
    };

    public deleteAllHousing = async () => {
        return await Housing.destroy({ where: {} });
    };
}

export default HousingDAO;
