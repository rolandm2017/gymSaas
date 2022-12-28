import express, { Request, Response } from "express";

import { HealthCheck } from "../enum/healthCheck.enum";
import JourneyService from "../service/journey.service";

class JourneyController {
    public path = "/journey";
    public router = express.Router();
    private journeyService: JourneyService;

    constructor(journeyService: JourneyService) {
        this.journeyService = journeyService;
        this.router.post("/pick", this.recordPick.bind(this));
        this.router.get(HealthCheck.healthCheck, this.healthCheck.bind(this));
    }

    public async recordPick(request: Request, response: Response) {
        const ip = request.ip;
        const apartmentId = request.body.apartmentId;
        await this.journeyService.recordPick(ip, apartmentId);
        return response.status(200).json({ message: "Success" });
    }

    async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ status: "Online" });
    }
}

export default JourneyController;
