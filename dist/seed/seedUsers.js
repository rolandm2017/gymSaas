"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_USERS = exports.ADMIN_ACCT_PASSWORD = void 0;
const refreshToken_dao_1 = __importDefault(require("../database/dao/refreshToken.dao"));
const role_enum_1 = require("../enum/role.enum");
const accountUtil_1 = __importDefault(require("../util/accountUtil"));
const constants_1 = require("../util/constants");
exports.ADMIN_ACCT_PASSWORD = process.env.ADMIN_PASSWORD || "foo";
const refreshTokenDAO = new refreshToken_dao_1.default();
const pwHash = new accountUtil_1.default(refreshTokenDAO).hash(exports.ADMIN_ACCT_PASSWORD);
exports.SEED_USERS = [
    {
        email: "rolandmackintosh@outlook.com",
        name: "Roland Mackintosh",
        passwordHash: pwHash,
        isVerified: true,
        verificationToken: "foo",
        role: role_enum_1.Role.Admin,
        passwordReset: 0,
        updated: 0,
        credits: constants_1.FREE_CREDITS,
        ipAddress: "255.255.255.1",
    },
];
