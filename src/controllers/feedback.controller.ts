import express, { Request, Response } from "express";

import { HealthCheck } from "../enum/healthCheck.enum";
import { RequestWithUser } from "../interface/RequestWithUser.interface";
import FeedbackService from "../service/feedback.service";
import { isString, isStringInteger } from "../validationSchemas/inputValidation";

class FeedbackController {
    public path = "/feedback";
    public router = express.Router();
    private feedbackService: FeedbackService;

    constructor(feedbackService: FeedbackService) {
        this.feedbackService = feedbackService;
        this.router.post("/new", this.leaveFeedback.bind(this));
        this.router.get("/all", this.getAllFeedback.bind(this));
        this.router.get(HealthCheck.healthCheck, this.healthCheck.bind(this));
    }

    public async leaveFeedback(request: RequestWithUser, response: Response) {
        // const acctId = // from request.user;
        const { feedback } = request.body;
        // todo: determine types of feedback
        await this.feedbackService.leaveFeedback(feedback);
        return response.status(200).json({ message: "Success" });
    }

    public async getAllFeedback(request: Request, response: Response) {
        const all = await this.feedbackService.getAllFeedback();
        return response.status(200).json({ all });
    }

    public async addMoreFeedback(request: Request, response: Response) {
        // we'll save incomplete forms as soon as user types to capture as much as possible; what if the user
        // doesn't finish writing? however, we want to update their form as they complete it! hence, this method.
        // todo: finish
        const updated = await this.feedbackService.addMoreFeedback();
        return response.status(200).json();
    }

    async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ status: "Online" });
    }
}

export default FeedbackController;
