// todo

import HousingDAO from "../database/dao/housing.dao";
import { Housing } from "../database/models/Housing";

class ApartmentService {
    private housingDAO: HousingDAO;
    constructor(housingDAO: HousingDAO) {
        this.housingDAO = housingDAO;
    }

    //
    public async getAllHousing(cityId: number, stateOrProvince: string, country?: string): Promise<Housing[]> {
        return await this.housingDAO.getAllHousing(cityId, stateOrProvince, country);
    }
}

export default ApartmentService;
