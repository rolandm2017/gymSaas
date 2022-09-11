import { Provider } from "../enum/provider.enum";
import Scraper from "./scraper";

const scraperAccess = {
    rentCanada: {
        site: "rentcanada,com",
        scraper_ip: "http://127.0.0.1:5000",
        scraper_port: 5000,
        type: "lat,long",
    },
    rentFaster: {
        site: "rentfaster.ca",
        scraper_ip: "http://127.0.0.1:5001",
        scraper_port: 5001,
        type: "lat,long",
    },
    rentSeeker: {
        site: "rentseeker.ca",
        scraper_ip: "http://127.0.0.1:5002",
        scraper_port: 5002,
        type: "lat,long",
    },
};

class ScraperFactory {
    constructor() {}

    createScraperOfType(source: Provider) {
        if (source === Provider.rentCanada) {
            const s = new Scraper(scraperAccess[source].site, scraperAccess[source].scraper_ip, scraperAccess[source].scraper_port);
            console.log(s, 14);
            return s;
        } else if (source === Provider.rentFaster) {
            const s = new Scraper(scraperAccess[source].site, scraperAccess[source].scraper_ip, scraperAccess[source].scraper_port);
            console.log(s, 14);
            return s;
        } else if (source === Provider.rentSeeker) {
            const s = new Scraper(scraperAccess[source].site, scraperAccess[source].scraper_ip, scraperAccess[source].scraper_port);
            console.log(s, 14);
            return s;
        } else {
            throw new Error("Invalid provider type");
        }
    }
}

export default ScraperFactory;
