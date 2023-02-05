import passport from "passport";
import { getFrontendURL } from "../util/URLMaker";

const successRedirectURL = getFrontendURL("/dashboard");
console.log("success redirect url", successRedirectURL);
export const googleAuth = passport.authenticate("google", { scope: ["email", "profile"], successRedirect: "localhost:8000" });

export const googleAuthCallback = passport.authenticate("google", { session: false });

export const passportJwt = passport.authenticate("jwt", { session: false });
