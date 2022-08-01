import express, { Request, Response } from "express";

class HousingController {
    public path = "/housing";
    public router = express.Router();

    constructor() {
        this.router.get("/scrape", this.scrapeApartments);
        this.router.get("/saved", this.getSavedApartments);
        this.router.post("/task", this.queueScrape);
    }

    async scrapeApartments(request: Request, response: Response) {
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return response.status(500).send({ err: "Parameter missing" }).end();
        }
        console.log(city, stateOrProvince, country, 19);
        // TODO: forward request to flask servers
        return response.status(200).send("You made it");
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

    async queueScrape(request: Request, response: Response) {
        const city = request.body.city;
        const stateOrProvince = request.body.state;
        const country = request.body.country;
        if (!city || !stateOrProvince || !country) {
            return response.status(500).send({ err: "Parameter missing" }).end();
        }
        console.log(city, stateOrProvince, country, 19);
        // TODO: store a job in a Jobs table.
        return response.status(200).send("You made it");
    }
}

export default HousingController;
