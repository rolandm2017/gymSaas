import { Cache } from "joi";
import { max, min } from "moment";
import AccountDAO from "../database/dao/account.dao";
import GymDAO from "../database/dao/gym.dao";
import HousingDAO from "../database/dao/housing.dao";
import ProfileDAO from "../database/dao/profile.dao";
import { Gym } from "../database/models/Gym";
import { Housing } from "../database/models/Housing";
import { Profile } from "../database/models/Profile";
import { ProviderEnum } from "../enum/provider.enum";
import { IDemoHousing } from "../interface/DemoHousing.interface";
import { IAssociation } from "../interface/Association.interface";
import { IHousing } from "../interface/Housing.interface";
import { IHousingWithUrl } from "../interface/HousingWithUrl.interface";
import { IQualificationReport } from "../interface/QualificationReport.interface";
import { MAX_ACCEPTABLE_LATITUDE_DIFFERENCE, MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE } from "../util/acceptableRadiusForWalking";
import { createRealUrl } from "../util/createRealUrl";
import { convertHousingsToDemoHousings, convertHousingToHousingWithUrl } from "../util/housingConverter";
import { removeBulkURLs } from "../util/removeUrl";
import CacheService from "./cache.service";
import ScraperService from "./scraper.service";
import { getDistanceInKMFromLatLong } from "../util/conversions";
import { convertGymModelToIGym } from "../util/convertGymModelToIGym";
import CityDAO from "../database/dao/city.dao";

class HousingService {
    private housingDAO: HousingDAO;
    private gymDAO: GymDAO;
    private accountDAO: AccountDAO;
    private profileDAO: ProfileDAO;
    private cityDAO: CityDAO;
    private cacheService: CacheService;
    private scraperService: ScraperService;

    constructor(
        housingDAO: HousingDAO,
        gymDAO: GymDAO,
        accountDAO: AccountDAO,
        profileDAO: ProfileDAO,
        cityDAO: CityDAO,
        cacheService: CacheService,
        scraperService: ScraperService,
    ) {
        this.housingDAO = housingDAO;
        this.gymDAO = gymDAO;
        this.accountDAO = accountDAO;
        this.profileDAO = profileDAO;
        this.cityDAO = cityDAO;
        this.cacheService = cacheService;
        this.scraperService = scraperService;
    }

    public async getDemoHousing(minLat: number, maxLat: number, minLong: number, maxLong: number): Promise<IDemoHousing[]> {
        const housings: Housing[] = await this.housingDAO.readBetween(minLat, maxLat, minLong, maxLong);
        return convertHousingsToDemoHousings(housings);
    }

    //
    public async getAllHousing(cityId?: number, cityName?: string, stateOrProvince?: string): Promise<IHousing[]> {
        console.log(cityId, cityName, stateOrProvince, "52rm");
        const housings = await this.housingDAO.getAllHousing(cityId, cityName, stateOrProvince);
        return removeBulkURLs(housings);
    }

    public async getQualifiedAps(cityId: number): Promise<IHousing[]> {
        // the apartments aren't getting their state id set right now, so ignore it
        // also don't need cityName since housings are stored by cityId
        const cityForIGym = await this.cityDAO.getCityById(cityId);
        if (cityForIGym === null) throw Error("No city for this id");

        const housings = await this.housingDAO.getAllHousingJustByCityId(cityId);
        const withoutURLs: IHousing[] = removeBulkURLs(housings);
        // const withGymAssociations = []
        const apsWithGyms = await Promise.all(
            withoutURLs.map(async (ap: IHousing) => {
                // return new Promise((resolve, reject) => {
                const nearbyGyms: Gym[] = await this.gymDAO.getGymsNear(ap.lat, ap.long);
                ap.nearbyGyms = nearbyGyms.map((gym: Gym) => {
                    const newAssociation: IAssociation = {
                        gym: convertGymModelToIGym(gym, cityForIGym.cityName),
                        distanceInKM: getDistanceInKMFromLatLong(ap.lat, ap.long, gym.lat, gym.long),
                    };
                    return newAssociation;
                });
                return ap;
            }),
        );
        return apsWithGyms;
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
        const wasBadlyFetched = housing.url === "" || housing.url === null;
        console.log(isAlreadyRevealedToAccount, apartmentId, "80rm");
        if (isAlreadyRevealedToAccount) {
            console.log(wasBadlyFetched, housing.idAtSource, "83rm");
            if (wasBadlyFetched && housing.idAtSource) {
                // retry
                const urlFromApi = await this.scraperService.getURLForApartment(housing.idAtSource);
                if (urlFromApi === "") {
                    this.handleDeadLink(housing.housingId);
                    return "Dead link detected";
                }
                console.log(urlFromApi, "url from api 87rm");
                await this.housingDAO.addUrlToHousing(apartmentId, urlFromApi);
                // do not deduct credit, do not add revealed to (because it already was/is)
                const realUrl = createRealUrl(urlFromApi, housing.source);
                console.log(realUrl, housing.idAtSource, "89rm");
                return realUrl;
            }
            console.log(housing.url, housing.source, "81rm");
            const realUrl = createRealUrl(housing.url, housing.source);
            return realUrl;
        }
        const availableCredits = await this.accountDAO.getCurrentCredits(accountId);
        if (availableCredits <= 0) {
            return "No credits available";
        }

        // if provider is rentCanada...
        const isFromRentCanada = housing.source === ProviderEnum.rentCanada;
        const alreadyRetrievedUrl = housing.url !== null && housing.url !== "";
        if (!isFromRentCanada || alreadyRetrievedUrl) {
            // (a) if the result is already there, return it
            this.tryDeductCredit(accountId);
            this.tryAddRevealedTo(profile, housing.housingId);
            console.log(housing.url, housing.source, "97rm");
            const realUrl = createRealUrl(housing.url, housing.source);
            return realUrl;
        }
        if (housing.idAtSource === null) {
            // should never happen...
            throw Error("Id failed to record for rentCanada");
        }
        // (b) if the result isn't already there, get the real URL using their API, cache the result, then return it
        const urlFromApi = await this.scraperService.getURLForApartment(housing.idAtSource);
        if (urlFromApi === "") {
            this.handleDeadLink(housing.housingId);
            return "Dead link detected";
        }
        console.log(housing.idAtSource, urlFromApi, "107rm");
        await this.housingDAO.addUrlToHousing(apartmentId, urlFromApi);
        this.tryDeductCredit(accountId);
        this.tryAddRevealedTo(profile, housing.housingId);
        console.log(housing.url, housing.source, "110rm");
        const realUrl = createRealUrl(urlFromApi, housing.source);
        return realUrl;
    }

    public async getRevealedRealUrlList(acctId: number): Promise<IHousingWithUrl[]> {
        const profile = await this.profileDAO.getProfileForAccountId(acctId);
        if (profile === null) {
            throw Error("No profile found for this account id");
        }
        const housings = await profile.getReveals();
        // check that they all have their urls. if any don't for whatever reason, go get them.
        for (const h of housings) {
            if (h.url === "" && h.idAtSource) {
                const urlFromApi = await this.scraperService.getURLForApartment(h.idAtSource);
                await this.housingDAO.addUrlToHousing(h.housingId, urlFromApi);
                h.url = urlFromApi;
            }
        }
        const housingsWithURLs: IHousingWithUrl[] = housings.map((housing: Housing) => {
            const apartment = convertHousingToHousingWithUrl(housing);
            apartment.url = createRealUrl(housing.url, housing.source);
            return apartment;
        });
        return housingsWithURLs;
    }

    public async getHousingByCityIdAndBatchNum(cityId: number, batchNum: number): Promise<IHousing[]> {
        const housings = await this.housingDAO.getHousingByCityIdAndBatchNum(cityId, batchNum);
        // const housingWithoutUrls: IHousing[] = housings.map(h => removeUrl(h));
        return removeBulkURLs(housings);
    }

    public async getApartmentsByLocation(cityName: string | undefined): Promise<Housing[]> {
        return await this.housingDAO.getApartmentsByLocation(cityName);
    }

    public async getUsingSearchQuery(cityName: string, minDist: number, maxDist: number, pageNum: number): Promise<Housing[]> {
        const cityId = await this.cacheService.getCityId(cityName);
        return await this.housingDAO.getUsingSearchQuery(cityId, minDist, maxDist, pageNum);
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
        return maxLong > minLong && maxLat > minLat;
    }

    public async handleDeadLink(housingId: number) {
        await this.housingDAO.deleteHousingByHousingId(housingId);
    }
}

export default HousingService;
