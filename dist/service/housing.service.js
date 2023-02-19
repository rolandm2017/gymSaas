"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const provider_enum_1 = require("../enum/provider.enum");
const acceptableRadiusForWalking_1 = require("../util/acceptableRadiusForWalking");
const createRealUrl_1 = require("../util/createRealUrl");
const housingConverter_1 = require("../util/housingConverter");
const removeUrl_1 = require("../util/removeUrl");
const conversions_1 = require("../util/conversions");
const convertGymModelToIGym_1 = require("../util/convertGymModelToIGym");
class HousingService {
    constructor(housingDAO, gymDAO, accountDAO, profileDAO, cityDAO, cacheService, scraperService) {
        this.housingDAO = housingDAO;
        this.gymDAO = gymDAO;
        this.accountDAO = accountDAO;
        this.profileDAO = profileDAO;
        this.cityDAO = cityDAO;
        this.cacheService = cacheService;
        this.scraperService = scraperService;
    }
    getDemoHousing(minLat, maxLat, minLong, maxLong) {
        return __awaiter(this, void 0, void 0, function* () {
            const housings = yield this.housingDAO.readBetween(minLat, maxLat, minLong, maxLong);
            if (housings.length <= 30) {
                return yield (0, housingConverter_1.convertHousingsToDemoHousings)(housings, this.gymDAO);
            }
            return yield (0, housingConverter_1.convertHousingsToDemoHousings)(housings.slice(0, 30), this.gymDAO);
        });
    }
    getMapPageHousing(minLat, maxLat, minLong, maxLong) {
        return __awaiter(this, void 0, void 0, function* () {
            const housings = yield this.housingDAO.readBetween(minLat, maxLat, minLong, maxLong);
            return (0, removeUrl_1.removeBulkURLs)(housings);
        });
    }
    //
    getAllHousing(cityId, cityName, stateOrProvince) {
        return __awaiter(this, void 0, void 0, function* () {
            const housings = yield this.housingDAO.getAllHousing(cityId, cityName, stateOrProvince);
            return (0, removeUrl_1.removeBulkURLs)(housings);
        });
    }
    getQualifiedAps(cityId) {
        return __awaiter(this, void 0, void 0, function* () {
            // the apartments aren't getting their state id set right now, so ignore it
            // also don't need cityName since housings are stored by cityId
            const cityForIGym = yield this.cityDAO.getCityById(cityId);
            if (cityForIGym === null)
                throw Error("No city for this id");
            const housings = yield this.housingDAO.getAllHousingJustByCityId(cityId);
            const withoutURLs = (0, removeUrl_1.removeBulkURLs)(housings);
            // const withGymAssociations = []
            const apsWithGyms = yield Promise.all(withoutURLs.map((ap) => __awaiter(this, void 0, void 0, function* () {
                // return new Promise((resolve, reject) => {
                const nearbyGyms = yield this.gymDAO.getGymsNear(ap.lat, ap.long);
                ap.nearbyGyms = nearbyGyms.map((gym) => {
                    const newAssociation = {
                        gym: (0, convertGymModelToIGym_1.convertGymModelToIGym)(gym, cityForIGym.cityName),
                        distanceInKM: (0, conversions_1.getDistanceInKMFromLatLong)(ap.lat, ap.long, gym.lat, gym.long),
                    };
                    return newAssociation;
                });
                return ap;
            })));
            return apsWithGyms;
        });
    }
    getRealURL(apartmentId, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
             * ** also handles deducting credit. if there is ever a payment system, I'll move this into a "payment controller"
             */
            const profile = yield this.profileDAO.getProfileForAccountId(accountId);
            if (profile === null) {
                throw Error("No profile found for this account id");
            }
            const housing = yield this.housingDAO.getHousingByHousingId(apartmentId);
            if (housing === null) {
                throw new Error("No housing found for this id");
            }
            const revealedToList = yield profile.getReveals();
            // if already revealed, return url
            const isAlreadyRevealedToAccount = revealedToList.map(housing => housing.housingId).includes(housing.housingId);
            const wasBadlyFetched = housing.url === "" || housing.url === null;
            if (isAlreadyRevealedToAccount) {
                if (wasBadlyFetched && housing.idAtSource) {
                    // retry
                    const urlFromApi = yield this.scraperService.getURLForApartment(housing.idAtSource);
                    if (urlFromApi === "") {
                        this.handleDeadLink(housing.housingId);
                        return "Dead link detected";
                    }
                    yield this.housingDAO.addUrlToHousing(apartmentId, urlFromApi);
                    // do not deduct credit, do not add revealed to (because it already was/is)
                    const realUrl = (0, createRealUrl_1.createRealUrl)(urlFromApi, housing.source);
                    return realUrl;
                }
                const realUrl = (0, createRealUrl_1.createRealUrl)(housing.url, housing.source);
                return realUrl;
            }
            const availableCredits = yield this.accountDAO.getCurrentCredits(accountId);
            if (availableCredits <= 0) {
                return "No credits available";
            }
            // if provider is rentCanada...
            const isFromRentCanada = housing.source === provider_enum_1.ProviderEnum.rentCanada;
            const alreadyRetrievedUrl = housing.url !== null && housing.url !== "";
            if (!isFromRentCanada || alreadyRetrievedUrl) {
                // (a) if the result is already there, return it
                this.tryDeductCredit(accountId);
                this.tryAddRevealedTo(profile, housing.housingId);
                const realUrl = (0, createRealUrl_1.createRealUrl)(housing.url, housing.source);
                return realUrl;
            }
            if (housing.idAtSource === null) {
                // should never happen...
                throw Error("Id failed to record for rentCanada");
            }
            // (b) if the result isn't already there, get the real URL using their API, cache the result, then return it
            const urlFromApi = yield this.scraperService.getURLForApartment(housing.idAtSource);
            if (urlFromApi === "") {
                this.handleDeadLink(housing.housingId);
                return "Dead link detected";
            }
            yield this.housingDAO.addUrlToHousing(apartmentId, urlFromApi);
            this.tryDeductCredit(accountId);
            this.tryAddRevealedTo(profile, housing.housingId);
            const realUrl = (0, createRealUrl_1.createRealUrl)(urlFromApi, housing.source);
            return realUrl;
        });
    }
    getRevealedRealUrlList(acctId) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.profileDAO.getProfileForAccountId(acctId);
            if (profile === null) {
                throw Error("No profile found for this account id");
            }
            const housings = yield profile.getReveals();
            // check that they all have their urls. if any don't for whatever reason, go get them.
            for (const h of housings) {
                if (h.url === "" && h.idAtSource) {
                    const urlFromApi = yield this.scraperService.getURLForApartment(h.idAtSource);
                    yield this.housingDAO.addUrlToHousing(h.housingId, urlFromApi);
                    h.url = urlFromApi;
                }
            }
            const housingsWithURLs = housings.map((housing) => {
                const apartment = (0, housingConverter_1.convertHousingToHousingWithUrl)(housing);
                apartment.url = (0, createRealUrl_1.createRealUrl)(housing.url, housing.source);
                return apartment;
            });
            return housingsWithURLs;
        });
    }
    getHousingByCityIdAndBatchNum(cityId, batchNum) {
        return __awaiter(this, void 0, void 0, function* () {
            const housings = yield this.housingDAO.getHousingByCityIdAndBatchNum(cityId, batchNum);
            // const housingWithoutUrls: IHousing[] = housings.map(h => removeUrl(h));
            return (0, removeUrl_1.removeBulkURLs)(housings);
        });
    }
    getApartmentsByLocation(cityName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.housingDAO.getApartmentsByLocation(cityName);
        });
    }
    getUsingSearchQuery(cityName, minDistInMin, maxDistInMin, pageNum) {
        return __awaiter(this, void 0, void 0, function* () {
            const cityId = yield this.cacheService.getCityId(cityName);
            const minDistInKM = (0, conversions_1.convertMinutesWalkedToKMTraveled)(minDistInMin);
            const maxDistInKM = (0, conversions_1.convertMinutesWalkedToKMTraveled)(maxDistInMin);
            const housing = yield this.housingDAO.getUsingSearchQuery(cityId, minDistInKM, maxDistInKM, pageNum);
            const totalPages = yield this.housingDAO.getCountOfSearchQuery(cityId, minDistInKM, maxDistInKM);
            return { results: (0, removeUrl_1.removeBulkURLs)(housing), totalPages };
        });
    }
    // step 4 of scraping process
    qualifyScrapedApartments(cityName) {
        return __awaiter(this, void 0, void 0, function* () {
            const relevantCityId = yield this.cacheService.getCityId(cityName);
            const gymsFromDb = yield this.gymDAO.getMultipleGyms(cityName);
            const gyms = gymsFromDb.rows;
            const affectedCount = {
                qualified: 0,
                total: 0,
            };
            for (const gym of gyms) {
                const lowerLimitLatitude = gym.lat - acceptableRadiusForWalking_1.MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
                const upperLimitLatitude = gym.lat + acceptableRadiusForWalking_1.MAX_ACCEPTABLE_LATITUDE_DIFFERENCE;
                const lowerLimitLongitude = gym.long - acceptableRadiusForWalking_1.MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
                const upperLimitLongitude = gym.long + acceptableRadiusForWalking_1.MAX_ACCEPTABLE_LONGITUDE_DIFFERENCE;
                const affectedHousings = yield this.housingDAO.markQualified(relevantCityId, lowerLimitLatitude, upperLimitLatitude, lowerLimitLongitude, upperLimitLongitude);
                affectedCount.qualified = affectedCount.qualified + affectedHousings[0];
            }
            const totalHousings = yield this.housingDAO.countHousingsInCity(relevantCityId);
            affectedCount.total = totalHousings;
            return affectedCount;
        });
    }
    // step 5 of scraping process
    deleteUnqualifiedApartments(cityName) {
        return __awaiter(this, void 0, void 0, function* () {
            const relevantCityId = yield this.cacheService.getCityId(cityName);
            const deletedHousings = yield this.housingDAO.deleteUnqualifiedHousingByCityId(relevantCityId);
            return deletedHousings;
        });
    }
    // step 6 of qualification process.
    addDistances() {
        return __awaiter(this, void 0, void 0, function* () {
            // go over qualified housings and add the distances to the gyms
            const all = yield this.housingDAO.getAllHousing();
            const allDistances = []; // returning for curiosity.
            for (const ap of all) {
                if (ap.distanceToNearestGym) {
                    continue; // no need to rerun loop; it's already been set.
                }
                const nearbyGyms = yield this.gymDAO.getGymsNear(ap.lat, ap.long);
                const distances = nearbyGyms.map((gym, index) => {
                    const distance = (0, conversions_1.convertLatLongDifferenceIntoKM)(ap.lat, ap.long, gym.lat, gym.long);
                    return { distance, index };
                });
                const smallestDistance = Math.min(...distances.map(({ distance }) => distance));
                allDistances.push(smallestDistance);
                ap.distanceToNearestGym = smallestDistance;
                ap.save();
            }
            return allDistances;
        });
    }
    deleteAllHousing() {
        return __awaiter(this, void 0, void 0, function* () {
            const affected = yield this.housingDAO.deleteAllHousing();
            return affected;
        });
    }
    tryAddRevealedTo(profile, housingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.profileDAO.addRevealedTo(profile, housingId);
            }
            catch (err) {
                console.log(err);
                console.log("Failed to add user to revealedTo list");
            }
        });
    }
    tryDeductCredit(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.accountDAO.deductCredit(accountId);
            }
            catch (err) {
                console.log(err);
                console.log("Failed to deduct a credit");
            }
        });
    }
    confirmIsGiantSquare(minLat, maxLat, minLong, maxLong) {
        return maxLong > minLong && maxLat > minLat;
    }
    handleDeadLink(housingId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.housingDAO.deleteHousingByHousingId(housingId);
        });
    }
}
exports.default = HousingService;
