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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const healthCheck_enum_1 = require("../enum/healthCheck.enum");
const role_enum_1 = require("../enum/role.enum");
const authorize_middleware_1 = __importDefault(require("../middleware/authorize.middleware"));
const handleErrorResponse_1 = require("../util/handleErrorResponse");
const feedbackSchemas_1 = require("../validationSchemas/feedbackSchemas");
class FeedbackController {
    constructor(feedbackService) {
        this.path = "/feedback";
        this.router = express_1.default.Router();
        this.feedbackService = feedbackService;
        this.router.post("/new/customer-feedback", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), feedbackSchemas_1.feedbackSchema, this.leaveFeedback.bind(this));
        this.router.post("/new/feature-req", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), feedbackSchemas_1.featureRequestSchema, this.requestFeature.bind(this));
        // this.router.put("/update", feedbackSchema, this.continueFeedback.bind(this));
        this.router.get("/all", this.getAllFeedback.bind(this));
        this.router.get(healthCheck_enum_1.HealthCheck.healthCheck, this.healthCheck.bind(this));
    }
    leaveFeedback(request, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accountId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.acctId;
                const noAccountId = accountId === undefined;
                if (noAccountId) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "Must be logged in");
                }
                const { questionOneAnswer, questionTwoAnswer, questionThreeAnswer, largeTextAnswer } = request.body;
                const success = yield this.feedbackService.leaveFeedback({ questionOneAnswer, questionTwoAnswer, questionThreeAnswer, largeTextAnswer }, accountId);
                return response.status(200).json({ success });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    requestFeature(request, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accountId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.acctId;
                const noAccountId = accountId === undefined;
                if (noAccountId) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "Must be logged in");
                }
                const { featureReqOneAnswer, featureReqTwoAnswer } = request.body;
                const success = yield this.feedbackService.requestFeature({ featureReqOneAnswer, featureReqTwoAnswer }, accountId);
                return response.status(200).json({ success });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getAllFeedback(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const all = yield this.feedbackService.getAllFeedback();
                return response.status(200).json({ all });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    // public async continueFeedback(request: Request, response: Response) {
    //     try {
    //         // we'll save incomplete forms as soon as user types to capture as much as possible; what if the user
    //         // doesn't finish writing? however, we want to update their form as they complete it! hence, this method.
    //         const { questionOneAnswer, questionTwoAnswer, largeTextAnswer, accountId } = request.body;
    //         const updated = await this.feedbackService.continueFeedback({ questionOneAnswer, questionTwoAnswer, largeTextAnswer }, accountId);
    //         return response.status(200).json({ updated });
    //     } catch (err) {
    //         return handleErrorResponse(response, err);
    //     }
    // }
    healthCheck(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            return response.status(200).json({ status: "Online" });
        });
    }
}
exports.default = FeedbackController;
