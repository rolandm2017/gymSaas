import { start } from "repl";
import FeedbackDAO from "../database/dao/feedback.dao";
import ProfileDAO from "../database/dao/profile.dao";
import { Feedback, FeedbackCreationAttributes } from "../database/models/Feedback";
import { FeedbackInputs } from "../interface/FeedbackInputs.interface";
import CacheService from "./cache.service";

class FeedbackService {
    private cacheService: CacheService;
    private feedbackDAO: FeedbackDAO;
    private profileDAO: ProfileDAO;
    constructor(cacheService: CacheService, feedbackDAO: FeedbackDAO, profileDAO: ProfileDAO) {
        this.cacheService = cacheService;
        this.feedbackDAO = feedbackDAO;
        this.profileDAO = profileDAO;
    }

    public async leaveFeedback(startingInput: FeedbackInputs, accountId: number): Promise<Feedback> {
        // For the FIRST request about feedback.
        // It is presumed that at least one of the startingInput fields is
        // partially filled in; or else, they wouldn't be here.
        const currentFormDetails = await this.cacheService.getCurrentQuestions();
        const relatedProfile = await this.profileDAO.getProfileForAccountId(accountId);
        const relatedProfileNotFound = relatedProfile === null;
        if (relatedProfileNotFound) {
            throw new Error("Related profile not found for this account id");
        }
        const filledInFields: FeedbackCreationAttributes = {
            ...startingInput,
            questionOne: currentFormDetails[0],
            questionTwo: currentFormDetails[1],
            profileId: relatedProfile.profileId,
        };
        const created = await this.feedbackDAO.createFeedback(filledInFields);
        return created;
    }

    public async getAllFeedback(accountId?: number): Promise<Feedback[]> {
        if (accountId) {
            const relatedProfile = await this.profileDAO.getProfileForAccountId(accountId);
            const relatedProfileNotFound = relatedProfile === null;
            if (relatedProfileNotFound) {
                throw new Error("Related profile not found for this account id");
            }
            const all = await this.feedbackDAO.getAllFeedbackForProfile(relatedProfile.profileId);
            return all;
        }
        return await this.feedbackDAO.getAllFeedback();
    }

    public async continueFeedback(additionalInput: FeedbackInputs, accountId: number): Promise<number> {
        // for LATER (as in ms later) requests to add feedback.
        const relatedProfile = await this.profileDAO.getProfileForAccountId(accountId);
        const relatedProfileNotFound = relatedProfile === null;
        if (relatedProfileNotFound) {
            throw new Error("Related profile not found for this account id");
        }
        const currentFeedbackArr = await this.feedbackDAO.getRecentFeedbackForProfile(relatedProfile.profileId);
        const currentFeedback = currentFeedbackArr[0];
        const updatedFeedback = { ...currentFeedback, ...additionalInput } as FeedbackCreationAttributes;
        const update = await this.feedbackDAO.continueFeedbackStream(updatedFeedback, relatedProfile.profileId);
        return update;
    }
}

export default FeedbackService;
