import express, { Request, response, Response } from "express";
import { ProviderEnum } from "../enum/provider.enum";
import { IBounds } from "../interface/Bounds.interface";
import ScraperService from "../service/scraper.service";
import HousingService from "../service/housing.service";
import { Housing } from "../database/models/Housing";
import { CityNameEnum } from "../enum/cityName.enum";
import { handleErrorResponse } from "../util/handleErrorResponse";
import { HealthCheck } from "../enum/healthCheck.enum";
import { isInteger, isLegitCityName, isProvider, isString, isStringFloat, isStringInteger } from "../validationSchemas/inputValidation";
import { detectViewportWidthSchema, getHousingByCityIdAndBatchNumSchema, searchQuerySchema } from "../validationSchemas/housingSchemas";
import authorize from "../middleware/authorize.middleware";
import { Role } from "../enum/role.enum";
import { IDemoHousing } from "../interface/DemoHousing.interface";
import { IHousing } from "../interface/Housing.interface";
import { IHousingWithUrl } from "../interface/HousingWithUrl.interface";

class HousingController {
    public path = "/housing";
    public router = express.Router();
    private housingService: HousingService;
    private scraperService: ScraperService;

    constructor(housingService: HousingService, scraperService: ScraperService) {
        this.housingService = housingService;
        this.scraperService = scraperService;

        // step 1 of 3 in queuing a scrape
        this.router.post("/viewport-width", detectViewportWidthSchema, this.detectProviderViewportWidth.bind(this));
        // public endpoint for demo
        this.router.get("/demo", this.getDemoContent.bind(this));
        this.router.get("/map-page", this.getMapPageContent.bind(this));
        // user queries
        this.router.get("/real-url/:apartmentid", authorize([Role.User]), this.getRealURL.bind(this));
        this.router.get("/real-url-list", authorize([Role.User]), this.getRevealedRealUrlList.bind(this));
        this.router.get("/search", authorize([Role.User]), searchQuerySchema, this.searchQuery.bind(this));
        // this.router.get("/saved", this.getSavedApartmentsByLocation.bind(this));
        // this.router.get("/location", authorize([Role.User]), this.getSavedApartmentsByLocation.bind(this));
        this.router.get("/by-location", this.getScrapedApartmentsByLocation.bind(this));
        this.router.get("/qualified/by-location", this.getQualifiedApartmentsByLocation.bind(this));
        this.router.get("/all", this.getAllApartments.bind(this));
        // "/delete-all" so "get all" and "delete all" don't have the same route with a different verb.
        // prevents accidental deletion.
        this.router.delete("/delete-all", authorize([Role.Admin]), this.deleteAllApartments.bind(this));
        // admin ish stuff
        this.router.get("/by-city-id-and-batch-id", getHousingByCityIdAndBatchNumSchema, this.getHousingByCityIdAndBatchNum.bind(this));
        // step 4 of queuing a scrape - for after the scrape of the city is done
        this.router.get("/qualify", this.qualifyScrapedApartments.bind(this));
        // step 5 of queuing a scrape - for after the apartments have been qualified
        this.router.delete("/unqualified", this.deleteUnqualifiedApartments.bind(this));
        // step 6 of queuing a scrape - add the distances
        this.router.get("/add-distances", this.addDistances.bind(this));
        this.router.get(HealthCheck.healthCheck, this.healthCheck);
        // this.router.post("/task", this.queueScrape);
    }

    public async getDemoContent(request: Request, response: Response) {
        try {
            const neLatInput = request.query.neLat;
            const neLongInput = request.query.neLong;
            const swLatInput = request.query.swLat;
            const swLongInput = request.query.swLong;

            const neLat = isStringFloat(neLatInput); // max lat
            const neLong = isStringFloat(neLongInput); // max long
            const swLat = isStringFloat(swLatInput); // min lat
            const swLong = isStringFloat(swLongInput); // min long

            // console.log("Lat min, lat max", swLat, neLat);
            // console.log("Long min, long max", swLong, neLong);
            const isGiantSquare = this.housingService.confirmIsGiantSquare(swLat, neLat, swLong, neLong);
            if (!isGiantSquare) {
                return response.status(400).json({ message: "No negative area squares" });
            }
            const demoContent: IDemoHousing[] = await this.housingService.getDemoHousing(swLat, neLat, swLong, neLong);
            return response.status(200).json({ demoContent });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getMapPageContent(request: Request, response: Response) {
        try {
            const neLatInput = request.query.neLat;
            const neLongInput = request.query.neLong;
            const swLatInput = request.query.swLat;
            const swLongInput = request.query.swLong;

            const neLat = isStringFloat(neLatInput); // max lat
            const neLong = isStringFloat(neLongInput); // max long
            const swLat = isStringFloat(swLatInput); // min lat
            const swLong = isStringFloat(swLongInput); // min long

            const isGiantSquare = this.housingService.confirmIsGiantSquare(swLat, neLat, swLong, neLong);
            if (!isGiantSquare) {
                return response.status(400).json({ message: "No negative area squares" });
            }
            const mapPageContent: IHousing[] = await this.housingService.getMapPageHousing(swLat, neLat, swLong, neLong);
            return response.status(200).json({ mapPageContent });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async detectProviderViewportWidth(request: Request, response: Response) {
        try {
            const city = request.body.city;
            const stateOrProvince = request.body.state;
            const providerInput = request.body.provider;
            const zoomWidthInput = request.body.zoomWidth;
            const provider = isProvider(providerInput); // throws if invalid
            const dimensions: IBounds = await this.scraperService.detectProviderViewportWidth(provider, city, stateOrProvince, zoomWidthInput);
            return response.status(200).json(dimensions);
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getHousingByCityIdAndBatchNum(request: Request, response: Response) {
        try {
            const byBatchNum = request.body.batchNum;
            const byCityId = request.body.cityId;
            const housing: IHousing[] = await this.housingService.getHousingByCityIdAndBatchNum(byCityId, byBatchNum);
            return response.status(200).json({ housing });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getScrapedApartmentsByLocation(request: Request, response: Response) {
        try {
            const cityIdInput = request.query.cityId;
            const cityNameInput = request.query.cityName;
            const stateOrProvinceInput = request.query.state;
            // validation
            // Note it could be an invalid state/province but, not checking that. It could just fail.
            const stateOrProvince = stateOrProvinceInput ? isString(stateOrProvinceInput) : undefined;
            const legitCityName = cityNameInput ? isLegitCityName(cityNameInput) : undefined;
            const cityId = cityIdInput ? isStringInteger(cityIdInput) : undefined;
            const apartments: IHousing[] = await this.housingService.getAllHousing(cityId, legitCityName, stateOrProvince);
            return response.status(200).json({ apartments, count: apartments.length });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getQualifiedApartmentsByLocation(request: Request, response: Response) {
        try {
            const cityIdInput = request.query.cityId;

            const cityId = isStringInteger(cityIdInput);
            const apartments: IHousing[] = await this.housingService.getQualifiedAps(cityId);
            return response.status(200).json({ apartments, count: apartments.length });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getRealURL(request: Request, response: Response) {
        try {
            const userId = request.user?.acctId;
            if (userId === undefined) {
                return handleErrorResponse(response, "No user defined on request");
            }
            const apartmentIdInput = request.params.apartmentid;
            const apartmentId = isStringInteger(apartmentIdInput);
            const serviceResponse = await this.housingService.getRealURL(apartmentId, userId);
            if (serviceResponse === "Dead link detected") {
                return response.status(500).json({ serviceResponse, success: false });
            }
            if (serviceResponse === "No credits available") {
                return response.status(400).json({ serviceResponse, success: false });
            }
            return response.status(200).json({ apartmentId, realURL: serviceResponse, success: true });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getRevealedRealUrlList(request: Request, response: Response) {
        try {
            //
            const userId = request.user?.acctId;
            if (userId === undefined) {
                return handleErrorResponse(response, "No user defined on request");
            }
            const revealedURLs: IHousingWithUrl[] = await this.housingService.getRevealedRealUrlList(userId);
            return response.status(200).json({ revealedURLs });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async searchQuery(request: Request, response: Response) {
        const cityNameInput = request.query.cityName;
        const minDistanceInput = request.query.minDistance;
        const maxDistanceInput = request.query.maxDistance;
        const pageNumInput = request.query.pageNum;
        try {
            const cityName = isLegitCityName(cityNameInput);
            const minDist = isStringFloat(minDistanceInput);
            const maxDist = isStringFloat(maxDistanceInput);
            const pageNum = isStringInteger(pageNumInput);
            const { results, totalPages } = await this.housingService.getUsingSearchQuery(cityName, minDist, maxDist, pageNum);
            return response.status(200).json({ pageNum, results, totalPages });
        } catch (err) {
            console.log({ cityNameInput, minDistanceInput, maxDistanceInput, pageNumInput });
            return handleErrorResponse(response, err);
        }
    }

    public async getAllApartments(request: Request, response: Response) {
        // Really: "Get ALL." Intended to be used by tests and admin to inspect stuff.
        try {
            const justCount = request.query.justCount;
            const apartments: IHousing[] = await this.housingService.getAllHousing();
            if (justCount) return response.status(200).json({ length: apartments.length });
            return response.status(200).json({ apartments, length: apartments.length });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async addDistances(request: Request, response: Response) {
        //
        const distances = await this.housingService.addDistances();
        return response.status(200).json({ message: "done", distances });
    }

    public async deleteAllApartments(request: Request, response: Response) {
        try {
            const affected: number = await this.housingService.deleteAllHousing();
            return response.status(200).json({ message: `Deleted ${affected} rows in the task queue` });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async qualifyScrapedApartments(request: Request, response: Response) {
        try {
            const cityName = request.query.cityName;
            if (typeof cityName !== "string") return handleErrorResponse(response, "cityName must be string");
            const legitCityName = Object.values(CityNameEnum).some(name => name == cityName);
            if (!legitCityName) return handleErrorResponse(response, "cityName was not legit");
            const details = await this.housingService.qualifyScrapedApartments(cityName);
            return response.status(200).json({ qualified: details.qualified, outOf: details.total, percent: details.qualified / details.total });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async deleteUnqualifiedApartments(request: Request, response: Response) {
        try {
            const cityName = request.query.cityName;
            if (typeof cityName !== "string") return handleErrorResponse(response, "cityName must be string");
            const legitCityName = Object.values(CityNameEnum).some(name => name == cityName);
            if (!legitCityName) return handleErrorResponse(response, "cityName was not legit");
            const numberOfDeleted = await this.housingService.deleteUnqualifiedApartments(cityName);
            return response.status(200).json({ numberOfDeleted });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ message: "Online" });
    }
}

export default HousingController;
