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
const parser_1 = __importDefault(require("./parser"));
// class will handle info about various scraper types. "is it a long/lat or city input? does it return aps with streets, coords, both?"
class Scraper {
    constructor(site, ip, port) {
        this.site = site;
        this.ip = ip;
        this.port = port;
    }
    scrape(lat, long, provider, zoomWidth) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.ip + ":" + this.port + "/";
            const json = JSON.stringify({ id: 0, lat, long, provider, zoomWidth });
            const results = yield axios_1.default.post(url, json, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            // note for reviewers: I argue that organizing (parsing) the data is part of the action, "to scrape"
            console.log(`parsing for ${provider}`);
            const parser = new parser_1.default(provider);
            // const housingData: IHousing[] = parser.parse(results.data);
            const housingData = parser.parse(results.data);
            return housingData;
        });
    }
    fetchUrlForId(idAtRentCanada) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpointUrl = this.ip + ":" + this.port + "/fetch-url?id=" + idAtRentCanada.toString();
            const result = yield axios_1.default.get(endpointUrl);
            const url = result.data;
            return url;
        });
    }
}
exports.default = Scraper;
