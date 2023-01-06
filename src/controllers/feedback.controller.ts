import express, { Request, Response } from "express";

import { HealthCheck } from "../enum/healthCheck.enum";
import { RequestWithUser } from "../interface/RequestWithUser.interface";
import FeedbackService from "../service/feedback.service";
import { feedbackSchema } from "../validationSchemas/feedbackSchemas";
import { isString, isStringInteger } from "../validationSchemas/inputValidation";

class FeedbackController {
    public path = "/feedback";
    public router = express.Router();
    private feedbackService: FeedbackService;

    constructor(feedbackService: FeedbackService) {
        this.feedbackService = feedbackService;
        this.router.post("/new", feedbackSchema, this.leaveFeedback.bind(this));
        this.router.put("/update", feedbackSchema, this.continueFeedback.bind(this));
        this.router.get("/all", this.getAllFeedback.bind(this));
        this.router.get(HealthCheck.healthCheck, this.healthCheck.bind(this));
    }

    public async leaveFeedback(request: RequestWithUser, response: Response) {
        // const acctId = // from request.user;
        const { questionOneAnswer, questionTwoAnswer, largeTextAnswer, accountId } = request.body;
        // todo: determine types of feedback
        const started = await this.feedbackService.leaveFeedback({ questionOneAnswer, questionTwoAnswer, largeTextAnswer }, accountId);
        return response.status(200).json({ started });
    }

    public async getAllFeedback(request: Request, response: Response) {
        const all = await this.feedbackService.getAllFeedback();
        return response.status(200).json({ all });
    }

    public async continueFeedback(request: Request, response: Response) {
        // we'll save incomplete forms as soon as user types to capture as much as possible; what if the user
        // doesn't finish writing? however, we want to update their form as they complete it! hence, this method.
        const { questionOneAnswer, questionTwoAnswer, largeTextAnswer, accountId } = request.body;
        const updated = await this.feedbackService.continueFeedback({ questionOneAnswer, questionTwoAnswer, largeTextAnswer }, accountId);
        return response.status(200).json({ updated });
    }

    async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ status: "Online" });
    }
}

export default FeedbackController;
