import passport from "passport";

export const googleAuth = passport.authenticate("google", { scope: ["email", "profile"], successRedirect: "http://localhost:3000" });

export const googleAuthCallback = passport.authenticate("google", { session: false });

export const passportJwt = passport.authenticate("jwt", { session: false });
