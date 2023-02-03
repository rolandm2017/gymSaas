"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class FeedbackService {
    constructor(cacheService, feedbackDAO, profileDAO) {
        this.cacheService = cacheService;
        this.feedbackDAO = feedbackDAO;
        this.profileDAO = profileDAO;
    }
    leaveFeedback(startingInput, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentFormDetails = yield this.cacheService.getCurrentQuestions();
            const relatedProfile = yield this.profileDAO.getProfileForAccountId(accountId);
            const relatedProfileNotFound = relatedProfile === null;
            if (relatedProfileNotFound) {
                throw new Error("Related profile not found for this account id");
            }
            const filledInFields = Object.assign(Object.assign({}, startingInput), { questionOne: currentFormDetails[0], questionTwo: currentFormDetails[1], questionThree: currentFormDetails[2], profileId: relatedProfile.profileId });
            const created = yield this.feedbackDAO.createFeedback(filledInFields);
            return created;
        });
    }
    requestFeature(requests, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            //
            const relatedProfile = yield this.profileDAO.getProfileForAccountId(accountId);
            const noProfileFound = relatedProfile === null;
            if (noProfileFound) {
                throw Error("No profile found for this account id");
            }
            const filledInFields = Object.assign(Object.assign({}, requests), { questionOne: "", questionTwo: "", questionThree: "", profileId: relatedProfile.profileId });
            const created = yield this.feedbackDAO.createFeedback(filledInFields);
            return created;
        });
    }
    getAllFeedback(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (accountId) {
                const relatedProfile = yield this.profileDAO.getProfileForAccountId(accountId);
                const relatedProfileNotFound = relatedProfile === null;
                if (relatedProfileNotFound) {
                    throw new Error("Related profile not found for this account id");
                }
                const all = yield this.feedbackDAO.getAllFeedbackForProfile(relatedProfile.profileId);
                return all;
            }
            return yield this.feedbackDAO.getAllFeedback();
        });
    }
}
exports.default = FeedbackService;
