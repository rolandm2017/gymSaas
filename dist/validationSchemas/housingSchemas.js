"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchQuerySchema = exports.getHousingByCityIdAndBatchNumSchema = exports.detectViewportWidthSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest_middleware_1 = __importDefault(require("../middleware/validateRequest.middleware"));
function detectViewportWidthSchema(req, res, next) {
    const schema = joi_1.default.object({
        city: joi_1.default.string(),
        state: joi_1.default.string(),
        provider: joi_1.default.string(),
        zoomWidth: joi_1.default.number(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.detectViewportWidthSchema = detectViewportWidthSchema;
function getHousingByCityIdAndBatchNumSchema(req, res, next) {
    const schema = joi_1.default.object({
        batchNum: joi_1.default.number(),
        cityId: joi_1.default.number(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.getHousingByCityIdAndBatchNumSchema = getHousingByCityIdAndBatchNumSchema;
function searchQuerySchema(req, res, next) {
    const schema = joi_1.default.object({
        cityName: joi_1.default.string(),
        minDistance: joi_1.default.number(),
        maxDistance: joi_1.default.number(),
        pageNum: joi_1.default.number(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.searchQuerySchema = searchQuerySchema;
