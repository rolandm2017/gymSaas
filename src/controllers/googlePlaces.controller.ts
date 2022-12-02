import express, { Request, Response } from "express";
//
import GymService from "../service/gym.service";

class GooglePlacesController {
    public path = "/google";
    public router = express.Router();
    private gymService: GymService;

    constructor(gymService: GymService) {
        this.gymService = gymService;
        this.router.get("/gyms", this.getGyms.bind(this));
        this.router.get("/saved", this.getSavedGymsFromDB.bind(this));
        this.router.delete("/all", this.deleteAll.bind(this));
    }

    async getGyms(request: Request, response: Response) {
        const cityName = request.query.cityName;
        const stateOrProvince = request.query.state;
        const country = request.query.country;
        if (typeof cityName !== "string" || typeof stateOrProvince !== "string" || typeof country !== "string") {
            return response.status(400).send({ err: "Parameter missing" }).end();
        }
        const gyms = await this.gymService.findGymsInLocation(country, stateOrProvince, cityName);
        const saved = await this.gymService.saveGyms(gyms, cityName);

        return response.status(200).json({ gyms, saved });
    }

    async getSavedGymsFromDB(request: Request, response: Response) {
        const city = request.query.city;
        if (typeof city !== "string") {
            return response.status(500).json({ err: "bad input" }).end();
        }
        const gymsFromDB = await this.gymService.getSavedGymsFromDB(city);

        return response.status(200).json(gymsFromDB);
    }

    async deleteAll(request: Request, response: Response) {
        const affected = await this.gymService.deleteAll();
        return response.status(200).json({ message: `Deleted ${affected} gyms in the db` });
    }
}

export default GooglePlacesController;
