// todo

import HousingDAO from "../database/dao/housing.dao";

class ApartmentService {
    private housingDAO: HousingDAO;
    constructor(housingDAO: HousingDAO) {
        this.housingDAO = housingDAO;
    }

    //
    public async getAll() {
        return this.housingDAO.getAllHousing();
    }
}

export default ApartmentService;
