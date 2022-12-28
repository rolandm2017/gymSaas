import express, { Request, Response } from "express";

import { HealthCheck } from "../enum/healthCheck.enum";
import ProfileService from "../service/profile.service";

class ProfileController {
    public path = "/profile";
    public router = express.Router();
    private profileService: ProfileService;

    constructor(profileService: ProfileService) {
        this.profileService = profileService;
        this.router.post("/pick-public", this.recordPickPublic.bind(this));
        this.router.get("/all/picks", this.getAllPicks.bind(this));
        this.router.get(HealthCheck.healthCheck, this.healthCheck.bind(this));
    }

    public async recordPickPublic(request: Request, response: Response) {
        const ip = request.ip;
        const apartmentId = request.body.apartmentId;
        await this.profileService.recordPickPublic(ip, apartmentId);
        return response.status(200).json({ message: "Success" });
    }

    public async recordPickWithAuth(request: Request, response: Response) {
        //
        // const userId =
        // const housingId = request.body.housingId;
        return response.status(200).json();
    }

    public async getAllPicks(request: Request, response: Response) {
        //
        const acctId = request.body.acctId;
        const picks = await this.profileService.getAllPicks(acctId);
        return response.status(200).json(picks);
    }

    async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ status: "Online" });
    }
}

export default ProfileController;
