import express, { Request, Response } from "express";
import { CityNameEnum } from "../enum/cityName.enum";
import { StateNamesEnum } from "../enum/stateName.enum";
//
import GymService from "../service/gym.service";
import { handleErrorResponse } from "../util/responses/handleErrorResponse";
import { isString } from "../validationSchemas/inputValidation";

class GymsController {
    public path = "/google";
    public router = express.Router();
    private gymService: GymService;

    constructor(gymService: GymService) {
        this.gymService = gymService;
        this.router.get("/gyms", this.getGymsFromGoogle.bind(this));
        this.router.get("/saved", this.getSavedGymsFromDB.bind(this));
        this.router.post("/add-city-id", this.addCityIdWhereMissing.bind(this));
        this.router.get("/count", this.countGymsByCity.bind(this));
        this.router.get("/all", this.getAllGyms.bind(this));
        this.router.delete("/all", this.deleteAll.bind(this));
    }

    async getGymsFromGoogle(request: Request, response: Response) {
        try {
            const cityName = request.query.cityName;
            const stateOrProvince = request.query.state;
            const country = request.query.country;
            // validation
            if (typeof cityName !== "string" || typeof stateOrProvince !== "string" || typeof country !== "string") {
                return handleErrorResponse(response, "Parameter missing or isn't string");
            }
            const legitCityName = Object.values(CityNameEnum).some(name => name == cityName);
            if (!legitCityName) return handleErrorResponse(response, "cityName was not legit");
            const legitStateName = Object.values(StateNamesEnum).some(name => name == stateOrProvince);
            if (!legitStateName) return handleErrorResponse(response, "state was not legit");
            //
            const gyms = await this.gymService.findGymsInLocation(country, stateOrProvince, cityName);
            const saved = await this.gymService.saveGyms(gyms, cityName);

            return response.status(200).json({ gyms, saved });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async getSavedGymsFromDB(request: Request, response: Response) {
        try {
            const cityNameInput = request.query.cityName;
            const cityName = isString(cityNameInput);
            const gymsFromDB = await this.gymService.getSavedGymsFromDB(cityName);
            return response.status(200).json(gymsFromDB);
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async addCityIdWhereMissing(request: Request, response: Response) {
        try {
            const correctedGyms = await this.gymService.correctNullEntries();
            return response.status(200).json({ correctedGyms });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async countGymsByCity(request: Request, response: Response) {
        try {
            const countedByCity = await this.gymService.countGymsByCity();
            return response.status(200).json({ countedByCity });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async getAllGyms(request: Request, response: Response) {
        try {
            const gyms = await this.gymService.getAllGyms();
            return response.status(200).json({ gyms });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async deleteAll(request: Request, response: Response) {
        try {
            const affected = await this.gymService.deleteAll();
            return response.status(200).json({ message: `Deleted ${affected} gyms in the db` });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }
}

export default GymsController;
