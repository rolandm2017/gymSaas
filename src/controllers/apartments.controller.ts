import express, { Request, Response } from "express";
import { ProviderEnum } from "../enum/provider.enum";
import { IBounds } from "../interface/Bounds.interface";
import { IHousing } from "../interface/Housing.interface";
import { ILatLong } from "../interface/LatLong.interface";
import ApartmentScraperService from "../service/apartment.service";
import GymFinderService from "../service/gym.service";
import { qualify } from "../util/qualify";

class ApartmentsController {
    public path = "/housing";
    public router = express.Router();

    constructor() {
        this.router.get("/scrape", this.scrapeApartments);
        this.router.get("/viewport_width", this.detectProviderViewportWidth);
        this.router.get("/grid_scan_plan", this.getGridForScan);
        this.router.get("/saved", this.getSavedApartments);
        // this.router.post("/task", this.queueScrape);
        this.router.get("/hardcode", this.getHardcodeApartments); // old test route
        this.router.get("/qualified", this.getQualifiedHardcodeApartments); // old test route
    }

    async scrapeApartments(request: Request, response: Response) {
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return response.status(500).send({ err: "Parameter missing" }).end();
        }
        console.log(city, stateOrProvince, country, "31rm");
        const scraper = new ApartmentScraperService();
        const aps: IHousing[] = await scraper.scrapeApartments(ProviderEnum.rentCanada, city, stateOrProvince, country); // todo: advance from hardcode provider choice
        // TODO: forward request to flask servers
        return response.status(200).send("You made it");
    }

    async detectProviderViewportWidth(request: Request, response: Response) {
        try {
            const city = request.body.city;
            const stateOrProvince = request.body.state;
            const country = request.body.country;
            if (!city || !stateOrProvince || !country) {
                return response.status(500).send({ err: "Parameter missing" }).end();
            }
            console.log(city, stateOrProvince, country, "46rm");
            const scraper = new ApartmentScraperService();
            const dimensions: IBounds = await scraper.detectProviderViewportWidth(ProviderEnum.rentCanada, city, stateOrProvince, country); // todo: advance from hardcode provider choice
            return response.status(200).json(dimensions);
        } catch {
            return response.status(500).send();
        }
    }

    async getGridForScan(request: Request, response: Response) {
        const startCoords: ILatLong = request.body.startCoords;
        const bounds: IBounds = request.body.bounds;
        const radius: number = request.body.radius;
        // not doing input validation here.
        const scraper = new ApartmentScraperService();
        console.log(startCoords, bounds, radius, "61rm");
        const gridCoords = scraper.planGrid(startCoords, bounds, radius);
        console.log(gridCoords, "63rm");
        return response.status(200).json(gridCoords);
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

    // async queueScrape(request: Request, response: Response) {
    //     const city = request.body.city;
    //     const stateOrProvince = request.body.state;
    //     const country = request.body.country;
    //     if (!city || !stateOrProvince || !country) {
    //         return response.status(500).send({ err: "Parameter missing" }).end();
    //     }
    //     console.log(city, stateOrProvince, country, 19);
    //     // TODO: store a job in a Jobs table.
    //     return response.status(200).send("You made it");
    // }

    async getHardcodeApartments(request: Request, response: Response) {}

    async getQualifiedHardcodeApartments(request: Request, response: Response) {}
}

export default ApartmentsController;
