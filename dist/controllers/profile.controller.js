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
const inputValidation_1 = require("../validationSchemas/inputValidation");
class ProfileController {
    constructor(profileService) {
        this.path = "/profile";
        this.router = express_1.default.Router();
        this.profileService = profileService;
        this.router.post("/create", this.associateProfileWithUser.bind(this));
        this.router.post("/pick-public/housing", this.recordPublicPickHousing.bind(this));
        this.router.post("/pick-public/gym", this.recordPublicPickGym.bind(this));
        this.router.post("/authed-pick/housing", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), this.recordAuthedPickHousing.bind(this));
        this.router.post("/authed-pick/gym", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), this.recordPickGymWithAuth.bind(this));
        this.router.get("/all/picks/housing", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), this.getAllHousingPicks.bind(this));
        this.router.get("/all/picks/housing/by-ip", this.getAllHousingPicksByIp.bind(this));
        this.router.get("/all/picks/gym", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), this.getAllGymPicks.bind(this));
        this.router.get("/all/picks/gym/by-ip", this.getAllGymPicksByIp.bind(this));
        this.router.delete("/pick/housing", (0, authorize_middleware_1.default)(), this.deleteHousingPick.bind(this));
        this.router.delete("/pick/gym", (0, authorize_middleware_1.default)(), this.deleteGymPick.bind(this));
        this.router.get(healthCheck_enum_1.HealthCheck.healthCheck, this.healthCheck.bind(this));
    }
    associateProfileWithUser(request, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accountId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.acctId;
                const ipAddress = request.ip;
                const noAccountId = accountId === undefined;
                if (noAccountId) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "Must be logged in");
                }
                yield this.profileService.associateProfileWithAccount(accountId, ipAddress);
                return response.status(200).json({ message: "Success!s" });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    recordPublicPickHousing(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ip = request.ip;
                const housingId = request.body.housingId;
                yield this.profileService.recordPublicPickHousing(ip, housingId);
                return response.status(200).json({ message: "Success" });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    recordPublicPickGym(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const ip = request.ip;
            const gymId = request.body.gymId;
            try {
                yield this.profileService.recordPublicPickGym(ip, gymId);
                return response.status(200).json({ message: "Success" });
            }
            catch (err) {
                console.log({ ip, gymId });
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    recordAuthedPickHousing(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (request.user === undefined) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "User is required");
                }
                const acctId = request.user.acctId;
                const housingId = request.body.housingId;
                const newPickId = yield this.profileService.recordAuthedPickHousing(acctId, housingId);
                return response.status(200).json({ newPickId, status: "Confirmed" });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    recordPickGymWithAuth(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (request.user === undefined) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "User is required");
                }
                // todo
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    // **
    // ** read section
    getAllHousingPicks(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //
                if (request.user === undefined) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "No user on request");
                }
                const acctId = request.user.acctId;
                const favorites = yield this.profileService.getAllHousingPicks(acctId);
                return response.status(200).json({ favorites });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getAllHousingPicksByIp(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // probably useful only in testing.
                // jan18 - its also useful for showing the unauthed user what they've picked
                const ip = request.ip;
                const housingPicks = yield this.profileService.getAllHousingPicksByIp(ip);
                return response.status(200).json({ housingPicks });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getAllGymPicks(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const acctId = request.body.acctId;
                const gymPicks = yield this.profileService.getAllGymPicks(acctId);
                return response.status(200).json({ gymPicks });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getAllGymPicksByIp(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // probably useful only in testing.
                const ip = request.ip;
                const gymPicks = yield this.profileService.getAllGymPicksByIp(ip);
                return response.status(200).json({ gymPicks });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    deleteHousingPick(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (request.user === undefined) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "User is required");
                }
                const acctId = request.user.acctId;
                const housingIdInput = request.body.housingId;
                const toDeleteId = (0, inputValidation_1.isInteger)(housingIdInput);
                const deleted = yield this.profileService.deleteHousingPick(acctId, toDeleteId);
                return response.status(200).json({ deleted });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    deleteGymPick(request, response) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const acctId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.acctId;
                const exists = (0, inputValidation_1.isInteger)(acctId);
                const toDeleteIdInput = request.body.toDeleteId;
                const toDeleteId = (0, inputValidation_1.isInteger)(toDeleteIdInput);
                const deleted = yield this.profileService.deleteGymPick(exists, toDeleteId);
                return response.status(200).json({ deleted });
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
exports.default = ProfileController;
