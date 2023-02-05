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
const passport_google_oauth2_1 = __importDefault(require("passport-google-oauth2"));
const passport_jwt_1 = require("passport-jwt");
const passport_jwt_2 = require("passport-jwt");
const account_dao_1 = __importDefault(require("../database/dao/account.dao"));
const URLMaker_1 = require("../util/URLMaker");
// https://www.makeuseof.com/nodejs-google-authentication/ may be useful if this breaks. The code is from there.
const accountDAO = new account_dao_1.default();
const GoogleStrategy = passport_google_oauth2_1.default.Strategy;
const googleClientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID : "fail";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET : "fail";
const secret = process.env.SECRET !== undefined ? process.env.SECRET : "Failed to load";
if (secret === "Failed to load") {
    throw new Error("SECRET not found in env file");
}
const passportConfig = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: (0, URLMaker_1.getBackendEndpoint)("/auth/google/callback"),
        passReqToCallback: true,
    }, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        // refresh token is undefined
        if (refreshToken !== undefined) {
            console.log("Refresh token was defined");
            console.log(refreshToken);
            throw new Error("Received unexpected refresh token argument");
        }
        // Q for reviewers & other coders: What should we do with the accessToken?
        // It looks like we *could* pass it on to use as the jwt for the system, but
        // do we need to?
        try {
            // todo: describe shape of profile object in an interface.
            // todo: get type of profile id
            const existingMember = yield accountDAO.getAccountByGoogleId(profile.id);
            // if member exists return the member
            const memberExists = existingMember !== null;
            if (memberExists) {
                return done(null, existingMember);
            }
            // if member does not exist create a new member
            console.log("Creating new member...");
            console.log(profile.emails[0]); // presuming the email they clicked on is the one sent in 0th position
            // note that google ids are 20 digit string integers, so they must be stored as a string, not an integer.
            const googleIdString = profile.id;
            let fullName = "";
            if (profile.firstName === undefined || profile.lastName === undefined) {
                fullName = "No name found";
            }
            else {
                fullName = profile.firstName + profile.lastName;
            }
            const newMember = yield accountDAO.createGoogleLoginAccount(fullName, googleIdString, profile.emails[0].value);
            req.accessToken = accessToken; // q: where does req go next?
            return done(null, newMember);
        }
        catch (error) {
            // Error 1: QueryFailedError: value "1047680853344410542227" is out of range for type integer
            console.log(error);
            return done(error, false);
        }
    })));
    passport.use(new passport_jwt_1.Strategy({
        // "Here, you are extracting the token from
        // the authorization header where it is stored—which is
        // much safer than storing it in the request body."
        jwtFromRequest: passport_jwt_2.ExtractJwt.fromHeader("authorization"),
        secretOrKey: secret,
    }, (jwtPayload, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // The comment I found on this portion of the code reads "Extract member", but
            // to be honest I have no idea what it's doing. "done(null, member)" ??
            const member = jwtPayload.user;
            done(null, member);
        }
        catch (error) {
            done(error, false);
        }
    })));
};
exports.default = passportConfig;
