import express, { Request, Response } from "express";
import GymFinderService from "../service/gym.service";

class GooglePlacesController {
    public test = "9000";
    public path = "/google";
    public router = express.Router();

    constructor() {
        this.router.get("/gyms", this.getGyms);
        this.router.get("/saved", this.getSavedGymsFromDB);
    }

    async getGyms(request: Request, response: Response) {
        console.log("In get gyms", 13);
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return response.status(400).send({ err: "Parameter missing" }).end();
        }
        const gymFinderService = new GymFinderService();
        const gyms = await gymFinderService.findGymsInLocation(country, stateOrProvince, city);
        // const gyms = [{}];
        gymFinderService.saveGyms(gyms, city, country);
        // console.log(gyms.length, "Number of gyms found");

        return response.status(200).json(gyms);
    }

    async getSavedGymsFromDB(request: Request, response: Response) {
        console.log("32rm");
        const city = request.body.city;
        const gymFinderService = new GymFinderService();
        const gymsFromDB = await gymFinderService.getSavedGymsFromDB(city);

        return response.status(200).json(gymsFromDB);
    }
}

export default GooglePlacesController;
