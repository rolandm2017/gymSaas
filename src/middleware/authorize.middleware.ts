import express, { NextFunction, Request, Response } from "express";
import { expressjwt as jwt } from "express-jwt";
import { RequestWithUser } from "../interface/RequestWithUser.interface";

const secret: string = process.env.SECRET !== undefined ? process.env.SECRET : "YOLO";
if (secret === "YOLO") {
    throw new Error("secret not found in env file");
}

// const jwt = require("express-jwt");
// const db = require("_helpers/db");

module.exports = authorize;

function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User')
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === "string") {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret, algorithms: ["HS256"] }),

        // authorize based on user role
        async (req: RequestWithUser, res: Response, next: NextFunction) => {
            const account = await db.Account.findById(req.user.id);
            const refreshTokens = await db.RefreshToken.find({ account: account.id });

            if (!account || (roles.length && !roles.includes(account.role))) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: "Unauthorized" });
            }

            // authentication and authorization successful
            req.user.role = account.role;
            // req.user.ownsToken = token => !!refreshTokens.find((x: any) => x.token === token);
            req.user.ownsToken = (token: string) => !!refreshTokens.find((x: any) => x.token === token);
            next();
        },
    ];
}