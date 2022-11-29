// todo

import HousingDAO from "../database/dao/housing.dao";
import { Housing } from "../database/models/Housing";

class ApartmentService {
    private housingDAO: HousingDAO;
    constructor(housingDAO: HousingDAO) {
        this.housingDAO = housingDAO;
    }

    //
    public async getAllHousing(cityId?: number, cityName?: string, stateOrProvince?: string): Promise<Housing[]> {
        return await this.housingDAO.getAllHousing(cityId, cityName, stateOrProvince);
    }

    public async getHousingByCityIdAndBatchNum(cityId: number, batchNum: number): Promise<Housing[]> {
        return await this.housingDAO.getHousingByCityIdAndBatchNum(cityId, batchNum);
    }

    public async getApartmentsByLocation(cityName: string | undefined): Promise<Housing[]> {
        return await this.housingDAO.getApartmentsByLocation(cityName);
    }
}

export default ApartmentService;
