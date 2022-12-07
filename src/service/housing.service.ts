import { Cache } from "joi";
import GymDAO from "../database/dao/gym.dao";
import HousingDAO from "../database/dao/housing.dao";
import { Housing } from "../database/models/Housing";
import { IDemoHousing } from "../interface/DemoHousing.interface";
import { IQualificationReport } from "../interface/QualificationReport.interface";
import { MAX_ACCEPTABLE_LATITUDE_DIFFERENCE, MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE } from "../util/acceptableRadiusForWalking";
import { convertHousingsToDemoHousings } from "../util/housingConverter";
import CacheService from "./cache.service";

class HousingService {
    private cacheService: CacheService;
    private housingDAO: HousingDAO;
    private gymDAO: GymDAO;

    constructor(housingDAO: HousingDAO, gymDAO: GymDAO, cacheService: CacheService) {
        this.housingDAO = housingDAO;
        this.gymDAO = gymDAO;
        this.cacheService = cacheService;
    }

    public async getDemoHousing(minLat: number, maxLat: number, minLong: number, maxLong: number): Promise<IDemoHousing[]> {
        const housings: Housing[] = await this.housingDAO.readBetween(10, 90, -5, -120);
        // const housings: Housing[] = await this.housingDAO.readBetween(minLat, maxLat, minLong, maxLong);
        console.log(housings.length, "24rm");
        const demoHousings: IDemoHousing[] = convertHousingsToDemoHousings(housings);
        console.log(demoHousings, "26rm");
        return demoHousings;
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

    // step 4 of scraping process
    public async qualifyScrapedApartments(cityName: string): Promise<IQualificationReport> {
        const relevantCityId = await this.cacheService.getCityId(cityName);
        const gymsFromDb = await this.gymDAO.getMultipleGyms(cityName);
        const gyms = gymsFromDb.rows;
        const affectedCount: IQualificationReport = {
            qualified: 0,
            total: 0,
        };
        for (const gym of gyms) {
            const lowerLimitLatitude = gym.lat - MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
            const upperLimitLatitude = gym.lat + MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
            const lowerLimitLongitude = gym.long - MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
            const upperLimitLongitude = gym.long + MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
            const affectedHousings = await this.housingDAO.markQualified(
                relevantCityId,
                lowerLimitLatitude,
                upperLimitLatitude,
                lowerLimitLongitude,
                upperLimitLongitude,
            );
            console.log(affectedHousings, "53rm");
            affectedCount.qualified = affectedCount.qualified + affectedHousings[0];
        }
        console.log(affectedCount, "56rm");
        const totalHousings = await this.housingDAO.countHousingsInCity(relevantCityId);
        affectedCount.total = totalHousings;
        return affectedCount;
    }

    // step 5 of scraping process
    public async deleteUnqualifiedApartments(cityName: string) {
        const relevantCityId = await this.cacheService.getCityId(cityName);
        const deletedHousings = await this.housingDAO.deleteUnqualifiedHousingByCityId(relevantCityId);
        return deletedHousings;
    }

    public async deleteAllHousing() {
        const affected = await this.housingDAO.deleteAllHousing();
        return affected;
    }
}

export default HousingService;
