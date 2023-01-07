import TaskDAO from "../database/dao/task.dao";
import { ProviderEnum } from "../enum/provider.enum";
import Scraper from "./scraper";

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
        scraperPort: 5001,
        type: "lat,long",
    },
    rentSeeker: {
        site: "rentseeker.ca",
        scraperIp: "http://127.0.0.1",
        scraperPort: 5002,
        type: "lat,long",
    },
};

class ScraperConnectionFactory {
    private rentCanadaScraper: Scraper;
    private rentFasterScraper: Scraper;
    private rentSeekerScraper: Scraper;

    constructor(taskDAO: TaskDAO) {
        this.rentCanadaScraper = new Scraper(
            scraperAccess[ProviderEnum.rentCanada].site,
            scraperAccess[ProviderEnum.rentCanada].scraperIp,
            scraperAccess[ProviderEnum.rentCanada].scraperPort,
        );
        this.rentFasterScraper = new Scraper(
            scraperAccess[ProviderEnum.rentFaster].site,
            scraperAccess[ProviderEnum.rentFaster].scraperIp,
            scraperAccess[ProviderEnum.rentFaster].scraperPort,
        );
        this.rentSeekerScraper = new Scraper(
            scraperAccess[ProviderEnum.rentSeeker].site,
            scraperAccess[ProviderEnum.rentSeeker].scraperIp,
            scraperAccess[ProviderEnum.rentSeeker].scraperPort,
        );
    }

    getScraperOfType(source: ProviderEnum) {
        if (source === ProviderEnum.rentCanada) return this.rentCanadaScraper;
        else if (source === ProviderEnum.rentFaster) return this.rentFasterScraper;
        else if (source === ProviderEnum.rentSeeker) return this.rentSeekerScraper;
        else throw new Error("Invalid provider type");
    }
}

export default ScraperConnectionFactory;
