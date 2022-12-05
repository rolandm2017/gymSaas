import express, { Request, response, Response } from "express";
import { ProviderEnum } from "../enum/provider.enum";
import { IBounds } from "../interface/Bounds.interface";
import ScraperService from "../service/scraper.service";
import HousingService from "../service/housing.service";
import { Housing } from "../database/models/Housing";
import { CityNameEnum } from "../enum/cityName.enum";
import { errorResponse } from "../util/errorResponseUtil";

class HousingController {
    public path = "/housing";
    public router = express.Router();
    private housingService: HousingService;
    private scraperService: ScraperService;

    constructor(housingService: HousingService, scraperService: ScraperService) {
        this.housingService = housingService;
        this.scraperService = scraperService;

        // public endpoint for demo
        this.router.get("/demo", this.getDemoContent.bind(this));
        // step 1 of 3 in queuing a scrape
        this.router.post("/viewport_width", this.detectProviderViewportWidth.bind(this));
        // user queries
        this.router.get("/location", this.getSavedApartmentsByLocation.bind(this));
        // admin ish stuff
        this.router.get("/by_city_id_and_batch_id", this.getHousingByCityIdAndBatchNum.bind(this));
        this.router.get("/saved", this.getSavedApartmentsByLocation.bind(this));
        this.router.get("/by_location", this.getSavedApartmentsByLocation.bind(this));
        this.router.get("/all", this.getAllApartments.bind(this));
        this.router.delete("/all", this.deleteAllApartments.bind(this)); // todo: authorize admin only
        // step 4 of queuing a scrape - for after the scrape of the city is done
        this.router.get("/qualify", this.qualifyScrapedApartments.bind(this));
        // step 5 of queuing a scrape - for after the apartments have been qualified
        this.router.delete("/unqualified", this.deleteUnqualifiedApartments.bind(this));
        this.router.get("/health_check", this.healthCheck);
        // this.router.post("/task", this.queueScrape);
    }

    async getDemoContent(request: Request, response: Response) {
        const cityName = request.query.cityName;
    }

    async detectProviderViewportWidth(request: Request, response: Response) {
        try {
            const city = request.body.city;
            const stateOrProvince = request.body.state;
            const providerInput = request.body.provider;
            if (!city || !stateOrProvince) {
                return errorResponse(response, 400, "Parameter missing");
            }
            const validProviderInput = Object.values(ProviderEnum).some(name => name === providerInput);
            if (!validProviderInput) return errorResponse(response, 400, "InvalId provider input");
            console.log(city, stateOrProvince, "46rm");
            const dimensions: IBounds = await this.scraperService.detectProviderViewportWidth(ProviderEnum.rentCanada, city, stateOrProvince); // todo: advance from hardcode provider choice
            return response.status(200).json(dimensions);
        } catch {
            return response.status(500).send();
        }
    }

    public async getHousingByCityIdAndBatchNum(request: Request, response: Response) {
        const byBatchNum = request.body.batchNum;
        const byCityId = request.body.cityId;
        if (!byBatchNum && !byCityId) return errorResponse(response, 400, "Missing parameter");
        if (byBatchNum && typeof byBatchNum !== "number") return errorResponse(response, 400, "batchNum must be int");
        if (byCityId && typeof byCityId !== "number") return errorResponse(response, 400, "cityId must be int");
        const housing: Housing[] = await this.housingService.getHousingByCityIdAndBatchNum(byCityId, byBatchNum);
        return response.status(200).json({ housing });
    }

    public async getSavedApartmentsByLocation(request: Request, response: Response) {
        const cityIdString = request.query.cityId;
        const cityName = request.query.cityName;
        const stateOrProvince = request.query.state;
        console.log(cityIdString, cityName, stateOrProvince, "72rm");
        if (!cityIdString && !stateOrProvince && !cityName) {
            return errorResponse(response, 400, "Parameter missing");
        }
        if (cityIdString && typeof cityIdString !== "string" && typeof cityIdString !== "number")
            return errorResponse(response, 400, "cityId must be number or string");
        if (cityName && typeof cityName !== "string") return errorResponse(response, 400, "cityName must be string");
        if (stateOrProvince && typeof stateOrProvince !== "string") return errorResponse(response, 400, "state must be string");
        const legitCityName = Object.values(CityNameEnum).some(name => name == cityName);
        if (!legitCityName) return errorResponse(response, 400, "cityName was not legit");
        if (cityIdString === undefined) return errorResponse(response, 400, "cityId undefined");
        const cityId: number | undefined = cityIdString ? parseInt(cityIdString, 10) : undefined;
        const apartments: Housing[] = await this.housingService.getAllHousing(cityId, cityName, stateOrProvince);
        return response.status(200).json({ apartments });
    }

    public async getAllApartments(request: Request, response: Response) {
        // keep this one SIMPLE. Really: "Get ALL."
        const apartments: Housing[] = await this.housingService.getAllHousing();
        return response.status(200).json({ apartments, length: apartments.length });
    }

    public async deleteAllApartments(request: Request, response: Response) {
        const affected: number = await this.housingService.deleteAllHousing();
        return response.status(200).json({ message: `Deleted ${affected} rows in the task queue` });
    }

    public async qualifyScrapedApartments(request: Request, response: Response) {
        const cityName = request.query.cityName;
        if (typeof cityName !== "string") return errorResponse(response, 400, "cityName must be string");
        const legitCityName = Object.values(CityNameEnum).some(name => name == cityName);
        if (!legitCityName) return errorResponse(response, 400, "cityName was not legit");
        const details = await this.housingService.qualifyScrapedApartments(cityName);
        return response.status(200).json({ qualified: details.qualified, outOf: details.total, percent: details.qualified / details.total });
    }

    public async deleteUnqualifiedApartments(request: Request, response: Response) {
        const cityName = request.query.cityName;
        if (typeof cityName !== "string") return errorResponse(response, 400, "cityName must be string");
        const legitCityName = Object.values(CityNameEnum).some(name => name == cityName);
        if (!legitCityName) return errorResponse(response, 400, "cityName was not legit");
        const numberOfDeleted = await this.housingService.deleteUnqualifiedApartments(cityName);
        return response.status(200).json({ numberOfDeleted });
    }

    public async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ message: "Online" });
    }
}

export default HousingController;
