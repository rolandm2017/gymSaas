import PassportGoogleAuth from "passport-google-oauth2";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import AccountDAO from "../database/dao/account.dao";

// https://www.makeuseof.com/nodejs-google-authentication/ may be useful if this breaks. The code is from there.

const accountDAO = new AccountDAO();

const GoogleStrategy = PassportGoogleAuth.Strategy;

const googleClientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID : "fail";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET : "fail";

const secret: string = process.env.SECRET !== undefined ? process.env.SECRET : "Failed to load";
if (secret === "Failed to load") {
    throw new Error("SECRET not found in env file");
}

const passportConfig = (passport: any) => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: googleClientId,
                clientSecret: googleClientSecret,
                callbackURL: "http://localhost:8000/auth/google/callback",
                passReqToCallback: true,
            },
            async (req: any, accessToken: string, refreshToken: any, profile: any, done: Function) => {
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
                    const existingMember = await accountDAO.getAccountByGoogleId(profile.id);
                    // if member exists return the member
                    const memberExists = existingMember !== null;
                    if (memberExists) {
                        return done(null, existingMember);
                    }
                    // if member does not exist create a new member
                    console.log("Creating new member...");
                    console.log(profile.emails[0]); // presuming the email they clicked on is the one sent in 0th position
                    // note that google ids are 20 digit string integers, so they must be stored as a string, not an integer.
                    const googleIdString: string = profile.id;
                    let fullName = "";
                    if (profile.firstName === undefined || profile.lastName === undefined) {
                        fullName = "No name found";
                    } else {
                        fullName = profile.firstName + profile.lastName;
                    }
                    console.log(profile.firstName, profile.lastName, "54rm");
                    const newMember = await accountDAO.createGoogleLoginAccount(fullName, googleIdString, profile.emails[0].value);

                    req.accessToken = accessToken; // q: where does req go next?
                    return done(null, newMember);
                } catch (error) {
                    // Error 1: QueryFailedError: value "1047680853344410542227" is out of range for type integer
                    console.log(error);
                    return done(error, false);
                }
            },
        ),
    );
    passport.use(
        new JwtStrategy(
            {
                // "Here, you are extracting the token from
                // the authorization header where it is stored—which is
                // much safer than storing it in the request body."
                jwtFromRequest: ExtractJwt.fromHeader("authorization"),
                secretOrKey: secret,
            },
            async (jwtPayload, done) => {
                try {
                    // The comment I found on this portion of the code reads "Extract member", but
                    // to be honest I have no idea what it's doing. "done(null, member)" ??
                    const member = jwtPayload.user;
                    done(null, member);
                } catch (error) {
                    done(error, false);
                }
            },
        ),
    );
};

export default passportConfig;
