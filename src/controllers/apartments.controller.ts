import express, { Request, Response } from "express";
import { Provider } from "../enum/provider.enum";
import ApartmentScraperService from "../service/apartment.service";

class HousingController {
    public path = "/housing";
    public router = express.Router();

    constructor() {
        this.router.get("/scrape", this.scrapeApartments);
        this.router.get("/saved", this.getSavedApartments);
        this.router.post("/task", this.queueScrape);
        this.router.get("/hardcode", this.getHardcodeApartments);
    }

    async scrapeApartments(request: Request, response: Response) {
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return response.status(500).send({ err: "Parameter missing" }).end();
        }
        console.log(city, stateOrProvince, country, 19);
        // TODO: forward request to flask servers
        return response.status(200).send("You made it");
    }

    async getSavedApartments(request: Request, response: Response) {
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return response.status(500).send({ err: "Parameter missing" }).end();
        }
        console.log(city, stateOrProvince, country, 19);
        // TODO: get results for this location from the db.
        return response.status(200).send("You made it");
    }

    async queueScrape(request: Request, response: Response) {
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return response.status(500).send({ err: "Parameter missing" }).end();
        }
        console.log(city, stateOrProvince, country, 19);
        // TODO: store a job in a Jobs table.
        return response.status(200).send("You made it");
    }

    async getHardcodeApartments(request: Request, response: Response) {
        try {
            let startProviders = request.query.providers;
            // console.log(startProviders, request.query.providers, "55rm");
            if (typeof startProviders !== "string") {
                return response.status(500).send({ err: "Provider missing" }).end();
            }
            let providers = startProviders.includes(",") ? startProviders.split(",") : [startProviders];
            if (providers.map(p => p in Provider).every(p => p)) {
                // providers must all be in Provider
            } else {
                return response.status(500).send({ err: "Provider specified is not a provider" }).end();
            }

            let apartments = [];
            const apartmentService = new ApartmentScraperService();
            for (let i = 0; i < providers.length; i++) {
                const p: Provider = providers[i] as Provider;
                console.log(p, "69rm");
                const stuff = await apartmentService.getDummyData(p);
                console.log(typeof stuff, stuff.length, "63rm");
                // TODO: feed stuff into a "geolocation service" via google to turn addr => lat,long
                apartments.push(stuff);
            }
            apartments = apartments.flat();
            return response.status(200).json({ apartments: apartments }).end();
        } catch (error) {
            return response.status(500).send({ error }).end();
        }
    }
}

export default HousingController;
