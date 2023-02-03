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
const handleErrorResponse_1 = require("../util/handleErrorResponse");
const inputValidation_1 = require("../validationSchemas/inputValidation");
class WishController {
    constructor(wishService) {
        this.path = "/wish";
        this.router = express_1.default.Router();
        this.wishService = wishService;
        this.router.post("/wish", this.createWish.bind(this));
        this.router.get("/all/wish/:accountid", this.getAllWishesForAccount.bind(this));
        this.router.get("/all/wish", this.getAllWishes.bind(this));
        this.router.get(healthCheck_enum_1.HealthCheck.healthCheck, this.healthCheck.bind(this));
    }
    createWish(request, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accountId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.acctId;
                const noAccountId = accountId === undefined;
                if (noAccountId) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "Must be logged in");
                }
                const wishLocationInput = request.body.wish;
                const wishLocation = (0, inputValidation_1.isString)(wishLocationInput);
                const added = yield this.wishService.createWish(wishLocation, accountId);
                return response.status(200).json({ added });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getAllWishesForAccount(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //
                const acctIdInput = request.body.accountId;
                const acctId = (0, inputValidation_1.isStringInteger)(acctIdInput);
                const found = yield this.wishService.getAllWishesForAccount(acctId);
                return response.status(200).json({ found });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getAllWishes(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const wishes = yield this.wishService.getAllWishes();
                return response.status(200).json({ wishes });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    healthCheck(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            return response.status(200).json({ status: "Online" });
        });
    }
}
exports.default = WishController;
