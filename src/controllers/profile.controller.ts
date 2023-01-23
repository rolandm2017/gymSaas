import express, { Request, Response } from "express";

import { HealthCheck } from "../enum/healthCheck.enum";
import { Role } from "../enum/role.enum";
import { IHousing } from "../interface/Housing.interface";
import authorize from "../middleware/authorize.middleware";
import ProfileService from "../service/profile.service";
import { handleErrorResponse } from "../util/handleErrorResponse";
import { isInteger } from "../validationSchemas/inputValidation";

class ProfileController {
    public path = "/profile";
    public router = express.Router();
    private profileService: ProfileService;

    constructor(profileService: ProfileService) {
        this.profileService = profileService;
        this.router.post("/create", this.associateProfileWithUser.bind(this));
        this.router.post("/pick-public/housing", this.recordPublicPickHousing.bind(this));
        this.router.post("/pick-public/gym", this.recordPublicPickGym.bind(this));
        this.router.post("/authed-pick/housing", authorize([Role.User]), this.recordAuthedPickHousing.bind(this));
        this.router.post("/authed-pick/gym", authorize([Role.User]), this.recordPickGymWithAuth.bind(this));
        this.router.get("/all/picks/housing", authorize([Role.User]), this.getAllHousingPicks.bind(this));
        this.router.get("/all/picks/housing/by-ip", this.getAllHousingPicksByIp.bind(this));
        this.router.get("/all/picks/gym", authorize([Role.User]), this.getAllGymPicks.bind(this));
        this.router.get("/all/picks/gym/by-ip", this.getAllGymPicksByIp.bind(this));
        this.router.delete("/pick/housing", authorize(), this.deleteHousingPick.bind(this));
        this.router.delete("/pick/gym", authorize(), this.deleteGymPick.bind(this));
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

    public async recordAuthedPickHousing(request: Request, response: Response) {
        try {
            console.log(request.user, "71rm");
            if (request.user === undefined) {
                return handleErrorResponse(response, "User is required");
            }
            const acctId = request.user.acctId;
            const housingId = request.body.housingId;
            console.log(acctId, housingId, "77rm");
            const newPickId = await this.profileService.recordAuthedPickHousing(acctId, housingId);
            return response.status(200).json({ newPickId, status: "Confirmed" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async recordPickGymWithAuth(request: Request, response: Response) {
        try {
            if (request.user === undefined) {
                return handleErrorResponse(response, "User is required");
            }
            // todo
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    // **
    // ** read section
    public async getAllHousingPicks(request: Request, response: Response) {
        try {
            //
            if (request.user === undefined) {
                return handleErrorResponse(response, "No user on request");
            }
            const acctId = request.user.acctId;
            const favorites: IHousing[] = await this.profileService.getAllHousingPicks(acctId);
            return response.status(200).json({ favorites });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getAllHousingPicksByIp(request: Request, response: Response) {
        try {
            // probably useful only in testing.
            // jan18 - its also useful for showing the unauthed user what they've picked
            const ip = request.ip;
            const housingPicks: IHousing[] = await this.profileService.getAllHousingPicksByIp(ip);
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
            return response.status(200).json({ gymPicks });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async deleteHousingPick(request: Request, response: Response) {
        try {
            if (request.user === undefined) {
                return handleErrorResponse(response, "User is required");
            }
            const acctId = request.user.acctId;
            const housingIdInput = request.body.housingId;
            const toDeleteId = isInteger(housingIdInput);
            const deleted = await this.profileService.deleteHousingPick(acctId, toDeleteId);
            return response.status(200).json({ deleted });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async deleteGymPick(request: Request, response: Response) {
        try {
            const acctId = request.user?.acctId;
            const exists = isInteger(acctId);
            const toDeleteIdInput = request.body.toDeleteId;
            const toDeleteId = isInteger(toDeleteIdInput);
            const deleted = await this.profileService.deleteGymPick(exists, toDeleteId);
            return response.status(200).json({ deleted });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ status: "Online" });
    }
}

export default ProfileController;
