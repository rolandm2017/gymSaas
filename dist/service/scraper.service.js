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
const provider_enum_1 = require("../enum/provider.enum");
const viewportSizeDetector_1 = require("../util/viewportSizeDetector");
const gridMaker_1 = require("../util/gridMaker");
const axios_1 = require("axios");
// const dotenvConfig = dotenv.config();
dotenv_1.default.config();
class ScraperService {
    constructor(scraperConnectionFactory, locationDiscoveryService) {
        this.scraperConnectionFactory = scraperConnectionFactory;
        this.locationDiscoveryService = locationDiscoveryService;
    }
    scrapeApartments(provider, city, stateOrProvince, country) {
        return __awaiter(this, void 0, void 0, function* () {
            // check the date of that return [] statement, this code is 3 weeks old and can probably go.
            // when the time comes to run the scraper, we can hide it from the network and /activate via this endpoint.
            // oneshots can also come thru here.
            return [];
        });
    }
    detectProviderViewportWidth(provider, city, stateOrProvince, zoomWidth) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // step 1: discover the viewport width. To be used in the grid maker as "jump" size.
            try {
                const scraper = this.scraperConnectionFactory.getScraperOfType(provider);
                const coords = yield this.locationDiscoveryService.geocoding("", city, stateOrProvince, "Canada");
                const results = yield scraper.scrape(coords.lat, coords.long, provider, zoomWidth);
                const dimensions = (0, viewportSizeDetector_1.detectViewportSize)(results);
                return dimensions;
                // todo: put detected width into db so dont have to keep redoing this.
            }
            catch (err) {
                if (err instanceof axios_1.AxiosError) {
                    console.log("AxiosErrorDetails:");
                    console.log(err.code, (_a = err.response) === null || _a === void 0 ? void 0 : _a.status);
                }
                else {
                    console.log(err);
                }
                // return something to appease the return type
                return { north: 0, south: 0, east: 0, west: 0, latitudeChange: 0, longitudeChange: 0, kmEastWest: 0, kmNorthSouth: 0 };
            }
        });
    }
    planGrid(startCoords, bounds, radius) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: move this into taskQueueService
            // step 2 of 3: plan the grid pattern the apis will scan in.
            // 'theSmallerOfTheTwo' was 1.5923049297275473 upon last inspection.
            const theSmallerOfTheTwo = bounds.kmEastWest > bounds.kmNorthSouth ? bounds.kmNorthSouth : bounds.kmEastWest;
            // choose the smaller of the two distances because we prefer some overlap instead of some space between snapshots
            const subdivisionLocations = (0, gridMaker_1.generateGrid)(startCoords, theSmallerOfTheTwo, radius);
            // todo: retrieve stored grid dimensions if they exist.
            return subdivisionLocations;
        });
    }
    getURLForApartment(idFromRentCanada) {
        return __awaiter(this, void 0, void 0, function* () {
            //
            try {
                const scraper = this.scraperConnectionFactory.getScraperOfType(provider_enum_1.ProviderEnum.rentCanada);
                const url = yield scraper.fetchUrlForId(idFromRentCanada);
                return url;
            }
            catch (err) {
                // console.log(err);
                console.log("Failed to access scraper");
                return "";
            }
        });
    }
}
exports.default = ScraperService;
