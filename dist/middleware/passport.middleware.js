"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passportJwt = exports.googleAuthCallback = exports.googleAuth = void 0;
const passport_1 = __importDefault(require("passport"));
const URLMaker_1 = require("../util/URLMaker");
const successRedirectURL = (0, URLMaker_1.getFrontendURL)("/dashboard");
console.log("success redirect url", successRedirectURL);
exports.googleAuth = passport_1.default.authenticate("google", { scope: ["email", "profile"], successRedirect: successRedirectURL });
exports.googleAuthCallback = passport_1.default.authenticate("google", { session: false });
exports.passportJwt = passport_1.default.authenticate("jwt", { session: false });
