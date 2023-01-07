import express, { Request, Response } from "express";

import { HealthCheck } from "../enum/healthCheck.enum";
import { RequestWithUser } from "../interface/RequestWithUser.interface";
import WishService from "../service/wish.service";
import { handleErrorResponse } from "../util/handleErrorResponse";
import { isString, isStringInteger } from "../validationSchemas/inputValidation";

class WishController {
    public path = "/wish";
    public router = express.Router();
    private wishService: WishService;

    constructor(wishService: WishService) {
        this.wishService = wishService;
        this.router.post("/wish", this.createWish.bind(this));
        this.router.get("/all/wish/:accountid", this.getAllWishesForAccount.bind(this));
        this.router.get("/all/wish", this.getAllWishes.bind(this));
        this.router.get(HealthCheck.healthCheck, this.healthCheck.bind(this));
    }

    public async createWish(request: RequestWithUser, response: Response) {
        try {
            const accountId = request.user?.acctId;
            const noAccountId = accountId === undefined;
            if (noAccountId) {
                return handleErrorResponse(response, "Must be logged in");
            }
            const wishLocationInput = request.body.wish;
            const wishLocation = isString(wishLocationInput);
            const added = await this.wishService.createWish(wishLocation, accountId);
            return response.status(200).json({ added });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getAllWishesForAccount(request: Request, response: Response) {
        try {
            //
            const acctIdInput = request.body.accountId;
            const acctId = isStringInteger(acctIdInput);
            const found = await this.wishService.getAllWishesForAccount(acctId);
            return response.status(200).json({ found });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getAllWishes(request: Request, response: Response) {
        try {
            const wishes = await this.wishService.getAllWishes();
            return response.status(200).json({ wishes });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ status: "Online" });
    }
}

export default WishController;
