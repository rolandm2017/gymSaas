import express, { Request, Response } from "express";

import { HealthCheck } from "../enum/healthCheck.enum";
import { RequestWithUser } from "../interface/RequestWithUser.interface";
import FeedbackService from "../service/feedback.service";
import { handleErrorResponse } from "../util/handleErrorResponse";
import { feedbackSchema } from "../validationSchemas/feedbackSchemas";

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
        try {
            // const acctId = // from request.user;
            const accountId = request.user?.acctId;
            const noAccountId = accountId === undefined;
            if (noAccountId) {
                return handleErrorResponse(response, "Must be logged in");
            }
            const { questionOneAnswer, questionTwoAnswer, largeTextAnswer } = request.body;
            // todo: determine types of feedback
            const started = await this.feedbackService.leaveFeedback({ questionOneAnswer, questionTwoAnswer, largeTextAnswer }, accountId);
            return response.status(200).json({ started });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getAllFeedback(request: Request, response: Response) {
        try {
            const all = await this.feedbackService.getAllFeedback();
            return response.status(200).json({ all });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async continueFeedback(request: Request, response: Response) {
        try {
            // we'll save incomplete forms as soon as user types to capture as much as possible; what if the user
            // doesn't finish writing? however, we want to update their form as they complete it! hence, this method.
            const { questionOneAnswer, questionTwoAnswer, largeTextAnswer, accountId } = request.body;
            const updated = await this.feedbackService.continueFeedback({ questionOneAnswer, questionTwoAnswer, largeTextAnswer }, accountId);
            return response.status(200).json({ updated });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    async healthCheck(request: Request, response: Response) {
        return response.status(200).json({ status: "Online" });
    }
}

export default FeedbackController;
