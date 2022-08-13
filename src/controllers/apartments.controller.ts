import express, { Request, Response } from "express";
import { Provider } from "../enum/provider.enum";
import { IHousing } from "../interface/Housing.interface";
import ApartmentScraperService from "../service/apartment.service";
import GymFinderService from "../service/gym.service";
import { qualify } from "../util/qualify";

class HousingController {
    public path = "/housing";
    public router = express.Router();

    constructor() {
        this.router.get("/scrape", this.scrapeApartments);
        this.router.get("/saved", this.getSavedApartments);
        this.router.post("/task", this.queueScrape);
        this.router.get("/hardcode", this.getHardcodeApartments);
        this.router.get("/qualified", this.getQualifiedHardcodeApartments);
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
            const startProviders = request.query.providers;
            // console.log(startProviders, request.query.providers, "55rm");
            if (typeof startProviders !== "string") {
                return response.status(500).send({ err: "Provider missing" }).end();
            }
            const providers = startProviders.includes(",") ? startProviders.split(",") : [startProviders];
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

    async getQualifiedHardcodeApartments(request: Request, response: Response) {
        try {
            // todo: try 1 km, 2, 3, 0.5, 0.3, 0.25 (0.25 km = 3 min @ 5 km/ 60 min)
            const qualificationRadiusInKM: number = typeof request.query.maxDistance === "string" ? parseInt(request.query.maxDistance, 10) : 0.75;
            const startProviders: string | undefined = typeof request.query.providers === "string" ? request.query.providers : "";
            console.log(qualificationRadiusInKM, typeof qualificationRadiusInKM, "90rm");
            // console.log(startProviders, request.query.providers, "55rm");
            if (typeof startProviders !== "string" || startProviders.length === 0) {
                return response.status(500).send({ err: "Provider missing" }).end();
            }
            const providers = startProviders.includes(",") ? startProviders.split(",") : [startProviders];
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
                const savedApartments: IHousing[] = await apartmentService.getDummyData(p);
                console.log(typeof savedApartments, savedApartments.length, "63rm");
                // TODO: feed stuff into a "geolocation service" via google to turn addr => lat,long
                apartments.push(savedApartments);
            }
            apartments = apartments.flat();

            const gymService = new GymFinderService();
            const gyms = await gymService.getSavedGymsFromDB("Montreal");
            // TODO: organize controllers. Does this endpoint belong in apartments, gyms, or "places"?
            const apartmentsWithNearbyGyms = qualify(apartments, gyms, qualificationRadiusInKM);

            return response.status(200).json({ apartments: apartmentsWithNearbyGyms }).end();
        } catch (error) {
            return response.status(500).send({ error }).end();
        }
    }
}

export default HousingController;
