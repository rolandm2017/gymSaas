import { Cache } from "joi";
import { max } from "moment";
import AccountDAO from "../database/dao/account.dao";
import GymDAO from "../database/dao/gym.dao";
import HousingDAO from "../database/dao/housing.dao";
import ProfileDAO from "../database/dao/profile.dao";
import { Housing } from "../database/models/Housing";
import { Profile } from "../database/models/Profile";
import { ProviderEnum } from "../enum/provider.enum";
import { IDemoHousing } from "../interface/DemoHousing.interface";
import { IHousing } from "../interface/Housing.interface";
import { IHousingWithUrl } from "../interface/HousingWithUrl.interface";
import { IQualificationReport } from "../interface/QualificationReport.interface";
import { MAX_ACCEPTABLE_LATITUDE_DIFFERENCE, MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE } from "../util/acceptableRadiusForWalking";
import { createRealUrl } from "../util/createRealUrl";
import { convertHousingsToDemoHousings } from "../util/housingConverter";
import { removeBulkURLs } from "../util/removeUrl";
import CacheService from "./cache.service";
import ScraperService from "./scraper.service";

class HousingService {
    private housingDAO: HousingDAO;
    private gymDAO: GymDAO;
    private accountDAO: AccountDAO;
    private profileDAO: ProfileDAO;
    private cacheService: CacheService;
    private scraperService: ScraperService;

    constructor(
        housingDAO: HousingDAO,
        gymDAO: GymDAO,
        accountDAO: AccountDAO,
        profileDAO: ProfileDAO,
        cacheService: CacheService,
        scraperService: ScraperService,
    ) {
        this.housingDAO = housingDAO;
        this.gymDAO = gymDAO;
        this.accountDAO = accountDAO;
        this.profileDAO = profileDAO;
        this.cacheService = cacheService;
        this.scraperService = scraperService;
    }

    public async getDemoHousing(minLat: number, maxLat: number, minLong: number, maxLong: number): Promise<IDemoHousing[]> {
        const housings: Housing[] = await this.housingDAO.readBetween(minLat, maxLat, minLong, maxLong);
        return convertHousingsToDemoHousings(housings);
    }

    //
    public async getAllHousing(cityId?: number, cityName?: string, stateOrProvince?: string): Promise<IHousing[]> {
        const housings = await this.housingDAO.getAllHousing(cityId, cityName, stateOrProvince);
        return removeBulkURLs(housings);
    }

    public async getRealURL(apartmentId: number, accountId: number): Promise<string> {
        /*
         * ** also handles deducting credit. if there is ever a payment system, I'll move this into a "payment controller"
         */
        const profile = await this.profileDAO.getProfileForAccountId(accountId);
        if (profile === null) {
            throw Error("No profile found for this account id");
        }
        const housing = await this.housingDAO.getHousingByHousingId(apartmentId);
        if (housing === null) {
            throw new Error("No housing found for this id");
        }
        const revealedToList = await profile.getReveals();
        // if already revealed, return url
        const isAlreadyRevealedToAccount = revealedToList.map(housing => housing.housingId).includes(housing.housingId);
        if (isAlreadyRevealedToAccount) {
            return createRealUrl(housing.url, housing.source);
        }
        const availableCredits = await this.accountDAO.getCurrentCredits(accountId);
        if (availableCredits <= 0) {
            return "No credits available";
        }

        // if provider is rentCanada...
        const isFromRentCanada = housing.source === ProviderEnum.rentCanada;
        const alreadyRetrievedUrl = housing.url !== null;
        if (!isFromRentCanada || alreadyRetrievedUrl) {
            // (a) if the result is already there, return it
            this.tryDeductCredit(accountId);
            this.tryAddRevealedTo(profile, housing.housingId);
            return createRealUrl(housing.url, housing.source);
        }
        if (housing.idAtSource === null) {
            // should never happen...
            throw Error("Id failed to record for rentCanada");
        }
        // (b) if the result isn't already there, get the real URL using their API, cache the result, then return it
        const urlFromApi = await this.scraperService.getURLForApartment(housing.idAtSource);
        await this.housingDAO.addUrlToHousing(apartmentId, urlFromApi);
        this.tryDeductCredit(accountId);
        this.tryAddRevealedTo(profile, housing.housingId);
        return createRealUrl(urlFromApi, ProviderEnum.rentCanada);
    }

    public async getRevealedRealUrlList(acctId: number): Promise<Housing[]> {
        const profile = await this.profileDAO.getProfileForAccountId(acctId);
        if (profile === null) {
            throw Error("No profile found for this account id");
        }
        const housings = await profile.getReveals();
        return housings;
    }

    public async getHousingByCityIdAndBatchNum(cityId: number, batchNum: number): Promise<IHousing[]> {
        const housings = await this.housingDAO.getHousingByCityIdAndBatchNum(cityId, batchNum);
        // const housingWithoutUrls: IHousing[] = housings.map(h => removeUrl(h));
        return removeBulkURLs(housings);
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

    private async tryAddRevealedTo(profile: Profile, housingId: number) {
        try {
            await this.profileDAO.addRevealedTo(profile, housingId);
        } catch (err) {
            console.log(err);
            console.log("Failed to add user to revealedTo list");
        }
    }

    private async tryDeductCredit(accountId: number) {
        try {
            await this.accountDAO.deductCredit(accountId);
        } catch (err) {
            console.log(err);
            console.log("Failed to deduct a credit");
        }
    }

    public confirmIsGiantSquare(minLat: number, maxLat: number, minLong: number, maxLong: number): boolean {
        console.log("east-west distance:", maxLong - minLong);
        console.log("north-south distance:", maxLat - minLat);
        console.log("is a giant square:", maxLong > minLong && maxLat > minLat);
        return maxLong > minLong && maxLat > minLat;
    }
}

export default HousingService;
