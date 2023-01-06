import { start } from "repl";
import FeedbackDAO from "../database/dao/feedback.dao";
import ProfileDAO from "../database/dao/profile.dao";
import { FeedbackCreationAttributes } from "../database/models/Feedback";
import { FeedbackInputs } from "../interface/FeedbackInputs.interface";
import CacheService from "./cache.service";

class FeedbackService {
    private feedbackDAO: FeedbackDAO;
    private profileDAO: ProfileDAO;
    private cacheService: CacheService;
    constructor(feedbackDAO: FeedbackDAO, profileDAO: ProfileDAO, cacheService: CacheService) {
        this.feedbackDAO = feedbackDAO;
        this.profileDAO = profileDAO;
        this.cacheService = cacheService;
    }

    public async leaveFeedback(startingInput: FeedbackInputs, accountId: number) {
        // for the FIRST request about feedback.
        const currentFormDetails = await this.cacheService.getCurrentQuestions();
        const relatedProfile = await this.profileDAO.getProfileForAccountId(accountId);
        const relatedProfileNotFound = relatedProfile === null;
        if (relatedProfileNotFound) {
            throw new Error("Related profile not found for this account id");
        }
        const filledInFields: FeedbackCreationAttributes = { ...startingInput, ...currentFormDetails, profileId: relatedProfile.profileId };
        const created = await this.feedbackDAO.createFeedback(filledInFields);
        return created;
    }

    public async getAllFeedback(accountId?: number) {
        if (accountId) {
            const relatedProfile = await this.profileDAO.getProfileForAccountId(accountId);
            const relatedProfileNotFound = relatedProfile === null;
            if (relatedProfileNotFound) {
                throw new Error("Related profile not found for this account id");
            }
            const all = await this.feedbackDAO.getAllFeedbackForAccount(relatedProfileId.profileId);
            return all;
        }
        return await this.feedbackDAO.getAllFeedback();
    }

    public async addMoreFeedback(additionalInput: FeedbackInputs, accountId: number) {
        // for LATER requests to add feedback.
    }
}

export default FeedbackService;
