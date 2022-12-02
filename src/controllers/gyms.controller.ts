import express, { Request, Response } from "express";
import { CityNameEnum } from "../enum/cityName.enum";
import { StateNames } from "../enum/stateName.enum";
//
import GymService from "../service/gym.service";

class GymsController {
    public path = "/google";
    public router = express.Router();
    private gymService: GymService;

    constructor(gymService: GymService) {
        this.gymService = gymService;
        this.router.get("/gyms", this.getGymsFromGoogle.bind(this));
        this.router.get("/saved", this.getSavedGymsFromDB.bind(this));
        this.router.post("/add_city_id", this.addCityIdWhereMissing.bind(this));
        this.router.get("/count", this.countGymsByCity.bind(this));
        this.router.get("/all", this.getAllGyms.bind(this));
        this.router.delete("/all", this.deleteAll.bind(this));
    }

    async getGymsFromGoogle(request: Request, response: Response) {
        const cityName = request.query.cityName;
        const stateOrProvince = request.query.state;
        const country = request.query.country;
        // validation
        if (typeof cityName !== "string" || typeof stateOrProvince !== "string" || typeof country !== "string") {
            return response.status(400).send({ err: "Parameter missing" }).end();
        }
        const legitCityName = Object.values(CityNameEnum).some(name => name == cityName);
        if (!legitCityName) return response.status(400).send({ err: "cityName was not legit" }).end();
        const legitStateName = Object.values(StateNames).some(name => name == stateOrProvince);
        if (!legitStateName) return response.status(400).send({ err: "state was not legit" }).end();
        //
        const gyms = await this.gymService.findGymsInLocation(country, stateOrProvince, cityName);
        const saved = await this.gymService.saveGyms(gyms, cityName);

        return response.status(200).json({ gyms, saved });
    }

    async getSavedGymsFromDB(request: Request, response: Response) {
        const cityName = request.query.cityName;
        console.log(cityName, "43rm");
        if (typeof cityName !== "string") {
            return response.status(500).json({ err: "bad input" }).end();
        }
        const gymsFromDB = await this.gymService.getSavedGymsFromDB(cityName);
        return response.status(200).json(gymsFromDB);
    }

    async addCityIdWhereMissing(request: Request, response: Response) {
        const correctedGyms = await this.gymService.correctNullEntries();
        return response.status(200).json({ correctedGyms });
    }

    async countGymsByCity(request: Request, response: Response) {
        const countedByCity = await this.gymService.countGymsByCity();
        return response.status(200).json({ countedByCity });
    }

    async getAllGyms(request: Request, response: Response) {
        const gyms = await this.gymService.getAllGyms();
        return response.status(200).json({ gyms });
    }

    async deleteAll(request: Request, response: Response) {
        const affected = await this.gymService.deleteAll();
        return response.status(200).json({ message: `Deleted ${affected} gyms in the db` });
    }
}

export default GymsController;
