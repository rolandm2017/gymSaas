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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// https://medium.com/swlh/how-to-implement-google-places-api-in-your-application-js-express-node-js-97b16da24835
// const dotenv = require("dotenv").config();
const dotenv_1 = __importDefault(require("dotenv"));
// const dotenvConfig = dotenv.config();
dotenv_1.default.config();
class GymService {
    constructor(gymDAO, cacheService, googlePlacesAPI) {
        this.gymDAO = gymDAO;
        this.cacheService = cacheService;
        this.googlePlacesAPI = googlePlacesAPI;
    }
    findGymsInLocation(country, state, city) {
        return __awaiter(this, void 0, void 0, function* () {
            let gyms = [];
            // initial request
            const request = this.googlePlacesAPI.embedLocation(country, state, city);
            let response = yield this.googlePlacesAPI.requestGyms(request);
            const results = this.convertJSONToGyms(response.data.results);
            gyms = [...gyms, ...results];
            const firstNextPgToken = response.data.next_page_token;
            // gather future responses
            let counter = 0;
            let nextPageToken = firstNextPgToken;
            yield new Promise(r => setTimeout(r, 2000));
            // const TEMP_LIMIT_FOR_DEVELOPMENT = 5;
            while (nextPageToken) {
                const nextResponse = yield this.googlePlacesAPI.requestGyms(request, nextPageToken);
                const nextPlacesBatch = nextResponse.data.results;
                nextPageToken = nextResponse.data.next_page_token;
                // convert gyms data to interfaces
                const nextPlacesGyms = this.convertJSONToGyms(nextPlacesBatch);
                gyms = [...gyms, ...nextPlacesGyms];
                // break;
                counter++;
                // // as per https://python.gotrained.com/google-places-api-extracting-location-data-reviews/#Search_for_Places
                // // "There is a delay until the  next_page_token is issued and validated. So you need to put a small sleep time
                // // like 2 seconds between each request. Otherwise, you will get an  INVALID_REQUEST status."
                yield new Promise(r => setTimeout(r, 2000)); // async delay 2 seconds
            }
            return gyms;
        });
    }
    convertJSONToGyms(gyms) {
        const output = [];
        for (let i = 0; i < gyms.length; i++) {
            const gym = gyms[i];
            gym.lat = gym.geometry.location.lat;
            gym.long = gym.geometry.location.lng;
            gym.formatted_address = gym.formatted_address;
            gym.business_status = "OPERATIONAL";
            output.push(gym);
        }
        return output;
    }
    saveGyms(gyms, cityName) {
        return __awaiter(this, void 0, void 0, function* () {
            // will be used for one city at a time.
            let successes = 0;
            const cityId = yield this.cacheService.getCityId(cityName);
            for (let i = 0; i < gyms.length; i++) {
                try {
                    const gymCreationAttr = {
                        cityName,
                        address: gyms[i].formatted_address,
                        url: gyms[i].icon,
                        lat: gyms[i].lat,
                        long: gyms[i].long,
                        icon: gyms[i].icon,
                        name: gyms[i].name,
                        rating: gyms[i].rating,
                        cityId: cityId,
                    };
                    yield this.gymDAO.createGym(gymCreationAttr);
                    successes++;
                }
                catch (err) {
                    if (err instanceof Error && err.name === "SequelizeUniqueConstraintError") {
                        console.log("duplicate entry detected!");
                    }
                    else {
                        console.log(err);
                    }
                }
            }
            return { successes, failures: gyms.length - successes };
        });
    }
    getSavedGymsFromDB(city) {
        return __awaiter(this, void 0, void 0, function* () {
            const gymsFromDb = yield this.gymDAO.getMultipleGyms(city);
            const rowsOfGyms = gymsFromDb.rows;
            return rowsOfGyms;
            // const gyms: IGym[] = [];
            // for (const row of rowsOfGyms) {
            //     const g: IGym = gymDbEntryToIGym(row);
            //     gyms.push(g);
            // }
            // return gyms;
        });
    }
    correctNullEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            const entriesToCorrect = yield this.gymDAO.getEntriesWithNullCityId();
            const namesOfMissingCities = Array.from(new Set(entriesToCorrect.map(gym => gym.cityName)));
            const correctedGymsTally = [];
            for (const cityName in namesOfMissingCities) {
                const correspondingCityId = yield this.cacheService.getCityId(cityName);
                const correspondingEntriesToCorrect = entriesToCorrect.filter(gym => gym.cityName === cityName);
                const corrected = yield this.gymDAO.addCityIdToGyms(correspondingEntriesToCorrect, correspondingCityId);
                correctedGymsTally.push(corrected);
            }
            return correctedGymsTally;
        });
    }
    countGymsByCity() {
        return __awaiter(this, void 0, void 0, function* () {
            const allGyms = yield this.gymDAO.getAllGyms();
            const cityNamesOnly = allGyms.map(gym => gym.cityName);
            const counted = cityNamesOnly.reduce(function (prev, cur) {
                prev[cur] = (prev[cur] || 0) + 1;
                return prev;
            }, {});
            return counted;
        });
    }
    getAllGyms() {
        return __awaiter(this, void 0, void 0, function* () {
            const gyms = yield this.gymDAO.getAllGyms();
            return gyms;
        });
    }
    deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const affected = yield this.gymDAO.deleteAllGyms();
            return affected;
        });
    }
}
// example queries
// const request = `https://maps.googleapis.com/maps/api/place/textsearch/json?`
// const query = `query=burgers+chelsea+manhattan+new+york+city&type=restaurant&key=${key}`
exports.default = GymService;
