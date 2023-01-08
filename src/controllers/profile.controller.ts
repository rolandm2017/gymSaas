import express, { Request, Response } from "express";

import { HealthCheck } from "../enum/healthCheck.enum";
import ProfileService from "../service/profile.service";
import { isString, isStringInteger } from "../validationSchemas/inputValidation";
import { handleErrorResponse } from "../util/handleErrorResponse";
import { RequestWithUser } from "../interface/RequestWithUser.interface";

class ProfileController {
    public path = "/profile";
    public router = express.Router();
    private profileService: ProfileService;

    constructor(profileService: ProfileService) {
        this.profileService = profileService;
        this.router.post("/create", this.associateProfileWithUser.bind(this));
        this.router.post("/pick-public/housing", this.recordPublicPickHousing.bind(this));
        this.router.post("/pick-public/gym", this.recordPublicPickGym.bind(this));
        this.router.get("/all/picks/housing", this.getAllHousingPicks.bind(this));
        this.router.get("/all/picks/housing/by-ip", this.getAllHousingPicksByIp.bind(this));
        this.router.get("/all/picks/gym", this.getAllGymPicks.bind(this));
        this.router.get("/all/picks/gym/by-ip", this.getAllGymPicksByIp.bind(this));
        this.router.get(HealthCheck.healthCheck, this.healthCheck.bind(this));
    }

    public async associateProfileWithUser(request: Request, response: Response) {
        try {
            const accountId = request.user?.acctId;
            const ipAddress = request.ip;
            const noAccountId = accountId === undefined;
            if (noAccountId) {
                return handleErrorResponse(response, "Must be logged in");
            }
            await this.profileService.associateProfileWithAccount(accountId, ipAddress);
            return response.status(200).json({ message: "Success!s" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async recordPublicPickHousing(request: Request, response: Response) {
        try {
            const ip = request.ip;
            const housingId = request.body.housingId;
            await this.profileService.recordPublicPickHousing(ip, housingId);
            return response.status(200).json({ message: "Success" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async recordPublicPickGym(request: Request, response: Response) {
        try {
            const ip = request.ip;
            const gymId = request.body.gymId;
            await this.profileService.recordPublicPickGym(ip, gymId);
            return response.status(200).json({ message: "Success" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async recordPickWithAuth(request: Request, response: Response) {
        try {
            //
            // const userId =
            // const housingId = request.body.housingId;
            return response.status(200).json();
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getAllHousingPicks(request: Request, response: Response) {
        try {
            //
            const acctId = request.body.acctId;
            const housingPicks = await this.profileService.getAllHousingPicks(acctId);
            return response.status(200).json({ housingPicks });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getAllHousingPicksByIp(request: Request, response: Response) {
        try {
            // probably useful only in testing.
            const ip = request.ip;
            const housingPicks = await this.profileService.getAllHousingPicksByIp(ip);
            return response.status(200).json({ housingPicks });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getAllGymPicks(request: Request, response: Response) {
        try {
            const acctId = request.body.acctId;
            const gymPicks = await this.profileService.getAllGymPicks(acctId);
            return response.status(200).json({ gymPicks });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getAllGymPicksByIp(request: Request, response: Response) {
        try {
            // probably useful only in testing.
            const ip = request.ip;
            const gymPicks = await this.profileService.getAllGymPicksByIp(ip);
            return response.status(200).json(gymPicks);
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ status: "Online" });
    }
}

export default ProfileController;
