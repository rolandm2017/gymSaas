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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const role_enum_1 = require("../enum/role.enum");
const constants_1 = require("./constants");
dotenv_1.default.config({ path: "./.env" });
const secret = process.env.SECRET !== undefined ? process.env.SECRET : "noSecretLoaded";
if (secret === "noSecretLoaded") {
    throw new Error("secret not found in env file");
}
class AccountUtil {
    constructor(refreshTokenDAO) {
        this.refreshTokenDAO = refreshTokenDAO;
    }
    randomTokenString() {
        return crypto_1.default.randomBytes(40).toString("hex");
    }
    hash(password) {
        return bcrypt_1.default.hashSync(password, 10);
    }
    getRefreshTokenByTokenString(tokenString) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshToken = yield this.refreshTokenDAO.getRefreshTokenByTokenString(tokenString);
            if (!refreshToken || !refreshToken.isActive)
                throw new Error("Invalid token");
            return refreshToken;
        });
    }
    generateJwtToken(account) {
        // create a jwt token containing the account id that expires in 15 minutes
        return jsonwebtoken_1.default.sign({ sub: account.acctId, acctId: account.acctId }, secret, { expiresIn: "15m" });
    }
    generateRefreshToken(account, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            // create a refresh token that expires in 7 days
            const accountId = account.acctId;
            const token = this.randomTokenString();
            const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const createdByIp = ipAddress;
            return yield this.refreshTokenDAO.createRefreshToken(accountId, token, expires, createdByIp);
        });
    }
    generatePasswordHash(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = yield bcrypt_1.default.hash(password, 10);
            return hash;
        });
    }
    attachMissingDetails(params, ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = Object.assign({}, params);
            const pwHash = yield this.generatePasswordHash(start.password);
            start.passwordHash = pwHash;
            start.verificationToken = "";
            start.updated = 0;
            // acct has user role unless one is made by the 'make admin' endpoint in admin controller
            start.role = role_enum_1.Role.User;
            start.credits = constants_1.FREE_CREDITS;
            start.ipAddress = ipAddress;
            const populated = Object.assign({}, start);
            return populated;
        });
    }
    convertAccountModelToInterface(startAccount) {
        if (startAccount.role !== role_enum_1.Role.Admin && startAccount.role !== role_enum_1.Role.User) {
            throw Error("No valid role found for user. Value was: " + startAccount.role);
        }
        const account = {
            acctId: startAccount.acctId,
            email: startAccount.email,
            name: startAccount.name,
            isVerified: startAccount.isVerified ? startAccount.isVerified : false,
            updated: startAccount.updated ? new Date(startAccount.updated) : new Date(),
            role: startAccount.role,
            passwordHash: startAccount.passwordHash,
            verificationToken: startAccount.verificationToken ? startAccount.verificationToken : "",
            credits: startAccount.credits,
        };
        if (account.passwordHash === undefined) {
            throw Error("No hashed password found");
        }
        return account;
    }
}
exports.default = AccountUtil;
