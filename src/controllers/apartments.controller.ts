import express, { Request, Response } from "express";
import { ProviderEnum } from "../enum/provider.enum";
import { IBounds } from "../interface/Bounds.interface";
import ScraperService from "../service/scraper.service";
import ApartmentService from "../service/apartment.service";
import { Housing } from "../database/models/Housing";

class ApartmentsController {
    public path = "/housing";
    public router = express.Router();
    private apartmentService: ApartmentService;
    private scraperService: ScraperService;

    constructor(apartmentService: ApartmentService, scraperService: ScraperService) {
        this.apartmentService = apartmentService;
        this.scraperService = scraperService;

        // step 1 of 3 in queuing a scrape
        this.router.get("/viewport_width", this.detectProviderViewportWidth.bind(this));
        // user queries
        this.router.get("/location", this.getSavedApartmentsByLocation.bind(this));
        // admin ish stuff
        this.router.get("/by_city_id_and_batch_id", this.getHousingByCityIdAndBatchNum.bind(this));
        this.router.get("/saved", this.getSavedApartmentsByLocation.bind(this));
        this.router.get("/all", this.getSavedApartmentsByLocation.bind(this));
        // this.router.post("/task", this.queueScrape);
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

    public async getHousingByCityIdAndBatchNum(request: Request, response: Response) {
        const byBatchNum = request.body.batchNum;
        const byCityId = request.body.cityId;
        if (!byBatchNum && !byCityId) return response.status(400).json({ error: "Missing parameter" });
        if (byBatchNum && typeof byBatchNum !== "number") return response.status(400).json({ error: "batchNum must be int" });
        if (byCityId && typeof byCityId !== "number") return response.status(400).json({ error: "cityId must be int" });
        const housing: Housing[] = await this.apartmentService.getHousingByCityIdAndBatchNum(byCityId, byBatchNum);
        return response.status(200).json({ housing });
    }

    public async getSavedApartmentsByLocation(request: Request, response: Response) {
        const cityId = request.body.cityId;
        const cityName = request.body.cityName;
        const stateOrProvince = request.body.state;
        if (!cityId && !stateOrProvince && !cityName) {
            return response.status(500).send({ err: "Parameter missing" }).end();
        }
        console.log(cityId, stateOrProvince, this.apartmentService, "72rm");
        const apartments: Housing[] = await this.apartmentService.getAllHousing(cityId, cityName, stateOrProvince);
        return response.status(200).send({ apartments });
    }
}

export default ApartmentsController;
