import { Op, fn, col } from "sequelize";
import { City } from "../models/City";
import { Housing, HousingCreationAttributes } from "../models/Housing";
import { State } from "../models/State";
import CityDAO from "./city.dao";
import StateDAO from "./state.dao";
import { TryCatchClassDecorator } from "../../util/tryCatchClassDecorator";
import { RESULTS_PER_PAGE } from "../../util/constants";

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

    public async createHousing(housing: HousingCreationAttributes) {
        return await Housing.create({ ...housing });
    }

    public async countHousingsInCity(cityId: number) {
        return await Housing.count({ where: { cityId } });
    }

    // read section
    public async getHighestHousingId(): Promise<number> {
        const highest = await Housing.max("housingId");
        if (Number(highest) === highest) {
            return highest;
        }
        throw Error("Got something other than a number from housing id");
    }

    public async getMultipleHousings(limit?: number, offset?: number): Promise<{ rows: Housing[]; count: number }> {
        if (limit === undefined && offset === undefined) return await Housing.findAndCountAll({ where: {} });
        return await Housing.findAndCountAll({ offset, limit });
    }

    public async getHousingByHousingId(housingId: number): Promise<Housing | null> {
        return await Housing.findByPk(housingId);
    }

    public async getAllHousingJustByCityId(cityId: number): Promise<Housing[]> {
        return await Housing.findAll({ where: { cityId } });
    }

    public async getAllHousing(cityId?: number, cityName?: string, stateOrProvince?: string) {
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
    }

    public async getQualifiedHousing(cityId?: number, cityName?: string, stateOrProvince?: string) {
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
    }

    public async getHousingByCityIdAndBatchNum(cityId: number, batchNum: number) {
        return await Housing.findAll({ where: { cityId, batchId: batchNum } });
    }

    public async getApartmentsByLocation(cityName: string | undefined) {
        const city: City | null = cityName ? await this.cityDAO.getCityByName(cityName) : null;
        if (city === null) return [];
        return await Housing.findAll({ where: { cityId: city.cityId } });
    }

    public async getUsingSearchQuery(cityId: number, minDist: number, maxDist: number, pageNum: number): Promise<Housing[]> {
        return await Housing.findAll({
            where: {
                cityId,
                distanceToNearestGym: {
                    [Op.between]: [minDist, maxDist],
                },
            },
            order: [["distanceToNearestGym", "ASC"]],
            limit: RESULTS_PER_PAGE,
            offset: pageNum * RESULTS_PER_PAGE,
        });
    }

    public async getCountOfSearchQuery(cityId: number, minDist: number, maxDist: number): Promise<number> {
        const all = await Housing.findAll({
            where: {
                cityId,
                distanceToNearestGym: {
                    [Op.between]: [minDist, maxDist],
                },
            },
            order: [["distanceToNearestGym", "ASC"]],
        });
        return all.length / RESULTS_PER_PAGE;
    }

    public async readBetween(lowerLimitLatitude: number, upperLimitLatitude: number, lowerLimitLongitude: number, upperLimitLongitude: number) {
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
    }

    // update section
    public async updateHousing(housing: HousingCreationAttributes, housingId: number) {
        return await Housing.update(housing, { where: { housingId } });
    }

    public async addUrlToHousing(housingId: number, url: string) {
        return await Housing.update({ url }, { where: { housingId } });
    }

    public async markQualified(
        cityId: number,
        lowerLimitLatitude: number,
        upperLimitLatitude: number,
        lowerLimitLongitude: number,
        upperLimitLongitude: number,
    ) {
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
    }

    // delete section
    public async deleteUnqualifiedHousingByCityId(cityId: number) {
        return await Housing.destroy({
            where: {
                cityId,
                nearAGym: null,
            },
        });
    }

    public async deleteHousingByHousingId(housingId: number) {
        return await Housing.destroy({ where: { housingId } });
    }

    public async deleteAllHousing() {
        return await Housing.destroy({ where: {} });
    }
}

export default HousingDAO;
