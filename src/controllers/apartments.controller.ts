import express, { Request, Response } from "express";
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
            let providers = request.body.providers;
            if (!providers) {
                return response.status(500).send({ err: "Provider missing" }).end();
            }
            providers = providers.includes(",") ? providers.split(",") : [providers];

            let apartments = [];
            const apartmentService = new ApartmentScraperService();
            for (let i = 0; i < providers.length; i++) {
                const stuff = await apartmentService.getDummyData(providers[i]);
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
