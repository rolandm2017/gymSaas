import express, { Request, Response } from "express";
import { ProviderEnum } from "../enum/provider.enum";
import { IBounds } from "../interface/Bounds.interface";
import { IHousing } from "../interface/Housing.interface";
import { ILatLong } from "../interface/LatLong.interface";
import ScraperService from "../service/scraper.service";
import GymFinderService from "../service/gym.service";
import { qualify } from "../util/qualify";
import ApartmentService from "../service/apartment.service";

class ApartmentsController {
    public path = "/housing";
    public router = express.Router();
    private apartmentService: ApartmentService;
    private scraperService: ScraperService;

    constructor(apartmentService: ApartmentService, scraperService: ScraperService) {
        this.apartmentService = apartmentService;
        this.scraperService = scraperService;

        // step 1 of 3 in queuing a scrape
        this.router.get("/viewport_width", this.detectProviderViewportWidth);

        this.router.get("/saved", this.getSavedApartments);
        this.router.get("/all", this.getSavedApartments);
        // this.router.post("/task", this.queueScrape);
    }

    // async scrapeApartments(request: Request, response: Response) {
    //     const city = request.body.city;
    //     const stateOrProvince = request.body.state;
    //     const country = request.body.country;
    //     if (!city || !stateOrProvince || !country) {
    //         return response.status(500).send({ err: "Parameter missing" }).end();
    //     }
    //     console.log(city, stateOrProvince, country, "31rm");
    //     const aps: IHousing[] = await this.scraperService.scrapeApartments(ProviderEnum.rentCanada, city, stateOrProvince, country); // todo: advance from hardcode provider choice
    //     // TODO: forward request to flask servers
    //     return response.status(200).send("You made it");
    // }

    async detectProviderViewportWidth(request: Request, response: Response) {
        try {
            const city = request.body.city;
            const stateOrProvince = request.body.state;
            const country = request.body.country;
            if (!city || !stateOrProvince || !country) {
                return response.status(500).send({ err: "Parameter missing" }).end();
            }
            console.log(city, stateOrProvince, country, "46rm");
            const dimensions: IBounds = await this.scraperService.detectProviderViewportWidth(
                ProviderEnum.rentCanada,
                city,
                stateOrProvince,
                country,
            ); // todo: advance from hardcode provider choice
            return response.status(200).json(dimensions);
        } catch {
            return response.status(500).send();
        }
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
