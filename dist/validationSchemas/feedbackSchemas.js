"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureRequestSchema = exports.feedbackSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest_middleware_1 = __importDefault(require("../middleware/validateRequest.middleware"));
function feedbackSchema(req, res, next) {
    const schema = joi_1.default.object({
        questionOneAnswer: joi_1.default.number(),
        questionTwoAnswer: joi_1.default.number(),
        questionThreeAnswer: joi_1.default.number(),
        largeTextAnswer: joi_1.default.string(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.feedbackSchema = feedbackSchema;
function featureRequestSchema(req, res, next) {
    const schema = joi_1.default.object({
        featureReqOneAnswer: joi_1.default.string(),
        featureReqTwoAnswer: joi_1.default.string(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.featureRequestSchema = featureRequestSchema;
