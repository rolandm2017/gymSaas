import express, { Request, Response } from "express";

import { HealthCheck } from "../enum/healthCheck.enum";
import WishService from "../service/wish.service";
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

    public async createWish(request: Request, response: Response) {
        //
        const acctIdInput = request.body.accountId;
        const wishLocationInput = request.body.wish;
        const acctId = isStringInteger(acctIdInput);
        const wishLocation = isString(wishLocationInput);
        const added = await this.wishService.createWish(wishLocation, acctId);
        return response.status(200).json({ added });
    }

    public async getAllWishesForAccount(request: Request, response: Response) {
        //
        const acctIdInput = request.body.accountId;
        const acctId = isStringInteger(acctIdInput);
        const found = await this.wishService.getAllWishesForAccount(acctId);
        return response.status(200).json({ found });
    }

    public async getAllWishes(request: Request, response: Response) {
        const wishes = await this.wishService.getAllWishes();
        return response.status(200).json({ wishes });
    }

    async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ status: "Online" });
    }
}

export default WishController;
