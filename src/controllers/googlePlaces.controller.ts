import express, { Request, Response } from "express";
import GymFinderService from "../service/gym.service";

class GooglePlacesController {
    public test = "9000";
    public path = "/google";
    public router = express.Router();
    private gymFinderService = new GymFinderService();

    constructor() {
        this.router.get("/gyms", this.getGyms);
    }

    async getGyms(request: Request, response: Response) {
        console.log("In get gyms", 13);
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return response.status(500).send({ err: "Parameter missing" }).end();
        }
        const gyms = await this.gymFinderService.findGymsInLocation(country, stateOrProvince, city);
        console.log(city, stateOrProvince, country, 19);
        return response.status(200).json(gyms);
    }
}

export default GooglePlacesController;
