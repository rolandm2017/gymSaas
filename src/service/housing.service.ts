import { Cache } from "joi";
import AccountDAO from "../database/dao/account.dao";
import GymDAO from "../database/dao/gym.dao";
import HousingDAO from "../database/dao/housing.dao";
import { Housing } from "../database/models/Housing";
import { ProviderEnum } from "../enum/provider.enum";
import { IDemoHousing } from "../interface/DemoHousing.interface";
import { IQualificationReport } from "../interface/QualificationReport.interface";
import { MAX_ACCEPTABLE_LATITUDE_DIFFERENCE, MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE } from "../util/acceptableRadiusForWalking";
import { createRealUrl } from "../util/createRealUrl";
import { convertHousingsToDemoHousings } from "../util/housingConverter";
import CacheService from "./cache.service";
import ScraperService from "./scraper.service";

class HousingService {
    private housingDAO: HousingDAO;
    private gymDAO: GymDAO;
    private accountDAO: AccountDAO;
    private cacheService: CacheService;
    private scraperService: ScraperService;

    constructor(housingDAO: HousingDAO, gymDAO: GymDAO, accountDAO: AccountDAO, cacheService: CacheService, scraperService: ScraperService) {
        this.housingDAO = housingDAO;
        this.gymDAO = gymDAO;
        this.accountDAO = accountDAO;
        this.cacheService = cacheService;
        this.scraperService = scraperService;
    }

    public async getDemoHousing(minLat: number, maxLat: number, minLong: number, maxLong: number): Promise<IDemoHousing[]> {
        const housings: Housing[] = await this.housingDAO.readBetween(10, 90, -5, -120);
        // const housings: Housing[] = await this.housingDAO.readBetween(minLat, maxLat, minLong, maxLong);
        const demoHousings: IDemoHousing[] = convertHousingsToDemoHousings(housings);
        return demoHousings;
    }

    //
    public async getAllHousing(cityId?: number, cityName?: string, stateOrProvince?: string): Promise<Housing[]> {
        return await this.housingDAO.getAllHousing(cityId, cityName, stateOrProvince);
    }

    // todo: make this deduct a credit from the user's account.
    public async getRealURL(apartmentId: number, accountId: number): Promise<string> {
        const availableCredits = await this.accountDAO.getCurrentCredits(accountId);
        if (availableCredits <= 0) {
            return "No credits available";
        }
        const housing = await this.housingDAO.getHousingByHousingId(apartmentId);
        if (housing === null) {
            throw new Error("No housing found for this id");
        }
        // if provider is rentCanada...
        const isFromRentCanada = housing.source === ProviderEnum.rentCanada;
        const alreadyRetrievedUrl = housing.url !== null;
        if (!isFromRentCanada || alreadyRetrievedUrl) {
            // (a) if the result is already there, return it
            try {
                await this.accountDAO.deductCredit(accountId);
            } catch {
                console.log("Failed to deduct a credit");
            }
            return createRealUrl(housing.url, housing.source);
        }
        if (housing.idAtSource === null) {
            // should never happen...
            throw Error("Id failed to record for rentCanada");
        }
        // (b) if the result isn't already there, get the real URL using their API, cache the result, then return it
        const urlFromApi = await this.scraperService.getURLForApartment(housing.idAtSource);
        await this.housingDAO.addUrlToHousing(apartmentId, urlFromApi);
        try {
            await this.accountDAO.deductCredit(accountId);
        } catch {
            console.log("Failed to deduct a credit");
        }
        return createRealUrl(urlFromApi, ProviderEnum.rentCanada);
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
            affectedCount.qualified = affectedCount.qualified + affectedHousings[0];
        }
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
