import TaskDAO from "../database/dao/task.dao";
import { ProviderEnum } from "../enum/provider.enum";
import Scraper from "./scraper";

const taskDAO = new TaskDAO();

const scraperAccess = {
    rentCanada: {
        site: "rentcanada.com",
        scraper_ip: "http://127.0.0.1",
        scraper_port: 5000,
        type: "lat,long",
    },
    rentFaster: {
        site: "rentfaster.ca",
        scraper_ip: "http://127.0.0.1",
        scraper_port: 5001,
        type: "lat,long",
    },
    rentSeeker: {
        site: "rentseeker.ca",
        scraper_ip: "http://127.0.0.1",
        scraper_port: 5002,
        type: "lat,long",
    },
};

class ScraperFactory {
    constructor() {}

    createScraperOfType(source: ProviderEnum) {
        console.log("here!");
        // if (source === Provider.rentCanada) {
        const s = new Scraper(scraperAccess[source].site, scraperAccess[source].scraper_ip, scraperAccess[source].scraper_port, taskDAO);
        return s;
        // } else if (source === Provider.rentFaster) {
        //     const s = new Scraper(scraperAccess[source].site, scraperAccess[source].scraper_ip, scraperAccess[source].scraper_port);
        //     return s;
        // } else if (source === Provider.rentSeeker) {
        //     const s = new Scraper(scraperAccess[source].site, scraperAccess[source].scraper_ip, scraperAccess[source].scraper_port);
        //     return s;
        // } else {
        //     throw new Error("Invalid provider type");
        // }
    }
}

export default ScraperFactory;
