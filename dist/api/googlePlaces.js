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
const axios_1 = __importDefault(require("axios"));
class GooglePlacesAPI {
    constructor() {
        this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    }
    getGymsByLatLong(lat, long, pageToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
            const pageTokenSegment = `&pageToken=${pageToken}`;
            const key = `&key=${this.apiKey}`;
            const url = baseURL + `?location=${this.makeLocation(lat, long)}&radius=1500&type=gym` + pageTokenSegment + key;
            // actual req
            const response = yield axios_1.default.get(url);
            const { data } = response;
            // useful bits
            const nextPageToken = data.next_page_token;
            const results = data.results;
            return { results, nextPageToken };
        });
    }
    embedLocation(country, province, city) {
        const gym = "gym";
        return `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${city}+${province}+${country}&type=${gym}&key=${this.apiKey}`;
    }
    makeLocation(long, lat) {
        return `${lat}%2C${long}`;
    }
    requestGyms(request, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const nextResponse = yield axios_1.default.get(request, { params: { pagetoken: token } });
            return nextResponse;
        });
    }
}
exports.default = GooglePlacesAPI;
