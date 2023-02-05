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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuthSchemas_1 = require("../validationSchemas/userAuthSchemas");
const authorize_middleware_1 = __importDefault(require("../middleware/authorize.middleware"));
const role_enum_1 = require("../enum/role.enum");
const handleErrorResponse_1 = require("../util/handleErrorResponse");
const healthCheck_enum_1 = require("../enum/healthCheck.enum");
const passport_middleware_1 = require("../middleware/passport.middleware");
const inputValidation_1 = require("../validationSchemas/inputValidation");
const URLMaker_1 = require("../util/URLMaker");
class AuthController {
    constructor(authService) {
        this.path = "/auth";
        this.router = express_1.default.Router();
        this.authService = authService;
        // ** passport stuff
        this.router.get("/google", passport_middleware_1.googleAuth);
        // Retrieve member data using the access token received;
        this.router.get("/google/callback", passport_middleware_1.googleAuthCallback, this.grantAccessToken.bind(this));
        // ** end passport stuff
        // login & register
        this.router.post("/register", userAuthSchemas_1.registerUserSchema, this.register.bind(this));
        this.router.post("/authenticate", userAuthSchemas_1.authenticateUserSchema, this.authenticate.bind(this));
        // verify email
        this.router.post("/verify-email", userAuthSchemas_1.verifyEmailSchema, this.verifyEmail.bind(this));
        this.router.get("/bypass-authentication-token", this.bypassEmail.bind(this));
        // tokens
        this.router.post("/refresh-token", this.refreshToken.bind(this));
        // note: /revoke-token === /log-out
        this.router.post("/revoke-token", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), userAuthSchemas_1.revokeTokenSchema, this.revokeToken.bind(this));
        // update pw
        this.router.post("/update-password", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), userAuthSchemas_1.updatePasswordSchema, this.updatePassword.bind(this));
        // pw reset
        this.router.post("/forgot-password", userAuthSchemas_1.forgotPasswordSchema, this.forgotPassword.bind(this));
        this.router.post("/validate-reset-token", userAuthSchemas_1.validateResetTokenSchema, this.validateResetToken.bind(this));
        this.router.post("/reset-password", userAuthSchemas_1.resetPasswordSchema, this.resetPassword.bind(this));
        // misc - payment stuff
        this.router.get("/remaining-credits", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), this.getRemainingCredits.bind(this));
        this.router.put("/free-credits", (0, authorize_middleware_1.default)([role_enum_1.Role.User]), this.getFreeCredits.bind(this));
        // authorized routes
        this.router.get("/", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), this.getAllAccounts.bind(this));
        this.router.get("/:id", (0, authorize_middleware_1.default)(), this.getAccountById.bind(this));
        this.router.post("/", (0, authorize_middleware_1.default)([role_enum_1.Role.Admin]), userAuthSchemas_1.createAccountSchema, this.createAccount.bind(this));
        this.router.put("/:id", (0, authorize_middleware_1.default)(), userAuthSchemas_1.updateRoleSchema, this.updateAccount.bind(this));
        this.router.delete("/:id", (0, authorize_middleware_1.default)(), this._deleteAccount.bind(this));
        this.router.get(healthCheck_enum_1.HealthCheck.healthCheck, this.healthCheck);
    }
    // **
    // ** passport stuff
    grantAccessToken(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://www.makeuseof.com/nodejs-google-authentication/
            // "If you log in, you will receive the token."
            try {
                const newUser = request.user;
                const ipAddress = request.ip;
                const accountDetails = yield this.authService.grantRefreshToken(newUser, ipAddress);
                // make a profile for them
                try {
                    yield this.authService.createProfileForGoogleUser(newUser.email, ipAddress);
                }
                catch (err) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
                }
                if (accountDetails.refreshToken === undefined)
                    throw Error("refresh token missing from authenticate response");
                this.setTokenCookie(response, accountDetails.refreshToken);
                const redirectURL = (0, URLMaker_1.getFrontendURL)() + "/dashboard";
                console.log(redirectURL, "should say apartmentsneargyms.com, 85rm");
                return response.redirect(redirectURL); // user gets access token from refresh-token endpoint.
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    authenticate(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = request.body.email;
                const password = request.body.password;
                const ipAddress = request.ip;
                const accountDetails = yield this.authService.authenticate(email, password, ipAddress);
                if (accountDetails.jwtToken === undefined)
                    throw Error("jwt missing from authenticate response");
                if (accountDetails.refreshToken === undefined)
                    throw Error("refresh token missing from authenticate response");
                this.setTokenCookie(response, accountDetails.refreshToken);
                delete accountDetails.refreshToken;
                return response.json(Object.assign(Object.assign({}, accountDetails), { jwtToken: accountDetails.jwtToken }));
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    register(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const origin = request.get("origin") || ""; // fixme: what on earth is origin and do I even need it?
                const ipAddr = request.ip;
                if (origin === undefined) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "Origin is required and was undefined");
                }
                const accountDetails = yield this.authService.register(request.body, ipAddr, origin);
                return response.json({
                    message: "Registration successful, please check your email for a verification code",
                    accountDetails,
                });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    verifyEmail(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokenInput = request.body.verificationCode;
                const token = (0, inputValidation_1.isString)(tokenInput);
                const { success, accountEmail } = yield this.authService.verifyEmail(token);
                if (success) {
                    try {
                        yield this.authService.createOrAssociateProfile(accountEmail);
                        return response.status(200).json({ message: "Verified!" });
                    }
                    catch (err) {
                        return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
                    }
                }
                else {
                    return response.status(500).json({ message: "Failed to verify" });
                }
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    refreshToken(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = request.cookies.refreshToken;
                const ipAddress = request.ip;
                const _a = yield this.authService.refreshToken(token, ipAddress), { refreshToken } = _a, account = __rest(_a, ["refreshToken"]);
                this.setTokenCookie(response, refreshToken);
                return response.json(account);
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    revokeToken(request, response, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // "log out"
            try {
                // accept token from request body or cookie
                const token = request.body.token || request.cookies.refreshToken;
                const ipAddress = request.ip;
                if (request.user === undefined) {
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "User is required");
                }
                if (!token)
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "Token is required");
                // users can revoke their own tokens and admins can revoke any tokens
                const userOwnsToken = yield this.authService.userOwnsToken(request.user.acctId, token);
                if (!userOwnsToken && request.user.role !== role_enum_1.Role.Admin) {
                    return response.status(401).json({ message: "Unauthorized" });
                }
                yield this.authService.revokeToken(token, ipAddress);
                return response.json({ message: "Token revoked" });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    bypassEmail(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = request.body.email;
                yield this.authService.logVerificationToken(email);
                return response.status(200).json({ message: "success" });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    updatePassword(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // include email, because if we didn't, then any logged in user could
                // try to change another logged in user's pw!
                const email = request.body.email;
                const oldPw = request.body.oldPw;
                const newPw = request.body.newPw;
                const confirmNewPw = request.body.confirmNewPw;
                if (newPw === undefined || confirmNewPw === undefined)
                    return response.json({ error: "A password was missing" });
                if (newPw !== confirmNewPw)
                    return response.json({ error: "Passwords did not match" });
                const success = yield this.authService.updatePassword(email, oldPw, newPw);
                if (success)
                    return response.json({ message: "Password updated!" });
                else
                    return response.json({ error: "You entered the wrong starting password" });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    // part of a 3 step(?) flow. forgotPw => validateResetToken => resetPw
    forgotPassword(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = request.body.email;
                // const origin = request.get("origin");
                // if (origin === undefined) {
                //     return handleErrorResponse(response, "Origin is required and was undefined");
                // }
                yield this.authService.forgotPassword(email);
                return response.json({ message: "Please check your email for password reset instructions" });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    validateResetToken(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = request.body.token;
                const success = yield this.authService.validateResetToken(token);
                if (success)
                    return response.json({ message: "Token is valid" });
                else
                    return response.json({ message: "Invalid token" });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    resetPassword(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = request.body.token;
                const password = request.body.password;
                const confirmed = request.body.confirmPassword;
                if (confirmed !== password)
                    return response.status(400).json({ message: "Passwords don't match" });
                const success = yield this.authService.resetPassword(token, password);
                if (success)
                    return response.json({ message: "Password reset successful, you can now login" });
                else
                    return response.json({ message: "Reset password failed" });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getRemainingCredits(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (request.user === undefined)
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "User missing");
                const acctId = request.user.acctId;
                const remainingCredits = yield this.authService.getRemainingCredits(acctId);
                return response.status(200).json({ remainingCredits });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getFreeCredits(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (request.user === undefined)
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "User missing");
                const acctId = request.user.acctId;
                const newCreditsAmount = yield this.authService.addFreeCredits(acctId);
                return response.status(200).json({ newCreditsAmount });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    // **
    // authorized routes
    // **
    getAllAccounts(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const accounts = yield this.authService.getAllAccounts();
                return response.json(accounts);
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    getAccountById(request, response) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requestedAcctId = request.body.acctId;
                if (requestedAcctId !== ((_a = request.user) === null || _a === void 0 ? void 0 : _a.acctId) && ((_b = request.user) === null || _b === void 0 ? void 0 : _b.role) !== role_enum_1.Role.Admin) {
                    return response.status(401).json({ message: "Unauthorized" });
                }
                const idAsNumber = parseInt(requestedAcctId, 10);
                const account = yield this.authService.getAccountById(idAsNumber);
                return account ? response.json(account) : response.sendStatus(404);
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    createAccount(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const account = this.authService.createAccount(request.body);
                return response.json(account);
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    updateAccount(request, response) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // users can update their own account and admins can update any account
                const idOfAcctToUpdate = request.body.acctId;
                if (idOfAcctToUpdate !== ((_a = request.user) === null || _a === void 0 ? void 0 : _a.acctId) && ((_b = request.user) === null || _b === void 0 ? void 0 : _b.role) !== role_enum_1.Role.Admin) {
                    return response.status(401).json({ message: "Unauthorized" });
                }
                const idAsNumber = parseInt(idOfAcctToUpdate, 10);
                const account = this.authService.updateAccount(idAsNumber, request.body);
                return response.json(account);
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    _deleteAccount(request, response) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // users can delete their own account and admins can delete any account
                const idOfAcctToDelete = request.body.acctId;
                if (request.user === undefined)
                    return (0, handleErrorResponse_1.handleErrorResponse)(response, "User missing");
                if (idOfAcctToDelete !== ((_a = request.user) === null || _a === void 0 ? void 0 : _a.acctId) && ((_b = request.user) === null || _b === void 0 ? void 0 : _b.role) !== role_enum_1.Role.Admin) {
                    return response.status(401).json({ message: "Unauthorized" });
                }
                yield this.authService.deleteAccount(request.params.id);
                return response.json({ message: "Account deleted successfully" });
            }
            catch (err) {
                return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
            }
        });
    }
    healthCheck(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            return response.json({ message: "ok" });
        });
    }
    setTokenCookie(response, token) {
        // create cookie with refresh token that expires in 7 days
        const cookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            sameSite: "none",
            secure: true,
        };
        response.cookie("refreshToken", token, cookieOptions);
    }
}
exports.default = AuthController;
