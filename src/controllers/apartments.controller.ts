import express, { Request, Response } from "express";

class HousingController {
    public path = "/housing";
    public router = express.Router();

    constructor() {
        this.router.get("/apartments", this.getApartments);
    }

    async getApartments(request: Request, response: Response) {
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return response.status(500).send({ err: "Parameter missing" }).end();
        }
        console.log(city, stateOrProvince, country, 19);
        return response.status(200).send("You made it");
    }
}

export default HousingController;
