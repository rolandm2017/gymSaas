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
exports.secret = void 0;
const express_jwt_1 = require("express-jwt");
const dotenv_1 = __importDefault(require("dotenv"));
const account_dao_1 = __importDefault(require("../database/dao/account.dao"));
const role_enum_1 = require("../enum/role.enum");
dotenv_1.default.config({ path: "./.env" });
exports.secret = process.env.SECRET !== undefined ? process.env.SECRET : "noSecretLoaded";
if (exports.secret === "noSecretLoaded") {
    throw new Error("secret not found in env file");
}
const acctDAO = new account_dao_1.default();
function authorize(validRoles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User')
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof validRoles === "string") {
        validRoles = [validRoles];
    }
    return [
        (0, express_jwt_1.expressjwt)({
            secret: exports.secret,
            algorithms: ["HS256"],
        }),
        // authorize based on user role
        (request, res, next) => __awaiter(this, void 0, void 0, function* () {
            // Note for Jason Watmore: If you're reading this, it looks like, at some point, express-jwt's devs changed things.
            // see https://stackoverflow.com/questions/34775687/express-jwt-setting-user-object-to-req-user-doc-instead-of-just-req-user
            // I discovered this while googling "jwt secret express jwt req.user"
            const acctInfo = request.auth;
            if ((acctInfo === null || acctInfo === void 0 ? void 0 : acctInfo.acctId) === undefined) {
                return res.status(401).json({ message: "39 - Unauthorized" });
            }
            request.user = {
                acctId: acctInfo.acctId,
            };
            const account = yield acctDAO.getAccountById(acctInfo.acctId);
            if (!account) {
                return res.status(401).json({ message: "47 - Unauthorized" });
            }
            const acctRole = account.role;
            const rolesFoundOnRequest = validRoles.length;
            let allowThrough = false;
            if (validRoles[0] === role_enum_1.Role.User && account.role === role_enum_1.Role.Admin) {
                // if user is admin, and the access point is "user", treat admin like a user.
                allowThrough = true;
            }
            if (rolesFoundOnRequest && !validRoles.includes(acctRole) && !allowThrough) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: "54 - Unauthorized" });
            }
            // authentication and authorization successful
            request.user.role = account.role;
            next();
        }),
    ];
}
exports.default = authorize;
