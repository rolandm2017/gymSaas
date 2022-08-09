import axios from "axios";

class Scraper {
    site: string;
    ip: string;
    port: number;

    constructor(site: string, ip: string, port: number) {
        this.site = site;
        this.ip = ip;
        this.port = port;
    }

    async scrape(city: string, state: string, country: "Canada" | "canada") {
        const url = "http://" + this.ip + this.port;
        const json = JSON.stringify({ city, state, country });
        const apartments = await axios.post(url, json);
        console.log(apartments, "18rm");
        return apartments;
    }
}

export default Scraper;
