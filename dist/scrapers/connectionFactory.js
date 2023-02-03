"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const provider_enum_1 = require("../enum/provider.enum");
const scraper_1 = __importDefault(require("./scraper"));
const scraperAccess = {
    rentCanada: {
        site: "rentcanada.com",
        scraperIp: "http://127.0.0.1",
        scraperPort: 5000,
        type: "lat,long",
    },
    rentFaster: {
        site: "rentfaster.ca",
        scraperIp: "http://127.0.0.1",
        scraperPort: 5000,
        type: "lat,long",
    },
    rentSeeker: {
        site: "rentseeker.ca",
        scraperIp: "http://127.0.0.1",
        scraperPort: 5000,
        type: "lat,long",
    },
};
class ScraperConnectionFactory {
    constructor(taskDAO) {
        this.rentCanadaScraper = new scraper_1.default(scraperAccess[provider_enum_1.ProviderEnum.rentCanada].site, scraperAccess[provider_enum_1.ProviderEnum.rentCanada].scraperIp, scraperAccess[provider_enum_1.ProviderEnum.rentCanada].scraperPort);
        this.rentFasterScraper = new scraper_1.default(scraperAccess[provider_enum_1.ProviderEnum.rentFaster].site, scraperAccess[provider_enum_1.ProviderEnum.rentFaster].scraperIp, scraperAccess[provider_enum_1.ProviderEnum.rentFaster].scraperPort);
        this.rentSeekerScraper = new scraper_1.default(scraperAccess[provider_enum_1.ProviderEnum.rentSeeker].site, scraperAccess[provider_enum_1.ProviderEnum.rentSeeker].scraperIp, scraperAccess[provider_enum_1.ProviderEnum.rentSeeker].scraperPort);
    }
    getScraperOfType(source) {
        if (source === provider_enum_1.ProviderEnum.rentCanada)
            return this.rentCanadaScraper;
        else if (source === provider_enum_1.ProviderEnum.rentFaster)
            return this.rentFasterScraper;
        else if (source === provider_enum_1.ProviderEnum.rentSeeker)
            return this.rentSeekerScraper;
        else
            throw new Error("Invalid provider type");
    }
}
exports.default = ScraperConnectionFactory;
