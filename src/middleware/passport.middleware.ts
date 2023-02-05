import passport from "passport";
import { getFrontendURL } from "../util/URLMaker";

export const googleAuth = passport.authenticate("google", { scope: ["email", "profile"], successRedirect: getFrontendURL("/dashboard") });

export const googleAuthCallback = passport.authenticate("google", { session: false });

export const passportJwt = passport.authenticate("jwt", { session: false });
