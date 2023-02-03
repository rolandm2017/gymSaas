"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const APIKEY = process.env.GOOGLE_GEOCODING_API_KEY;
// The service converts e.g. "vancouver, BC, Canada" into lat and long. Or an address into a long/lat.
class LocationDiscoveryService {
    // todo: declare service dependencies using 'private' kwd
    constructor() { }
    latLongDiscovery(city, state, country) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: go to Google, type in "citty string country lat long" and return the result.
        });
    }
    geocoding(addr, city, state, country) {
        return __awaiter(this, void 0, void 0, function* () {
            // use google geocoding api to get the coords of an address
            console.log("in", APIKEY);
            const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${APIKEY}&address=${city} ${state} ${country}`;
            const results = yield axios_1.default.get(url);
            let coords = results.data.results[0].geometry.location;
            // const coords = results.data.results.geometry.location;
            coords = { lat: coords.lat, long: coords.lng };
            // const coords = { lat: results.data.results.geometry.location.lat, long: results.data.results.geometry.location.long };
            return coords;
        });
    }
}
exports.default = LocationDiscoveryService;
