import { NextFunction, Response } from "express";
import { expressjwt as jwt } from "express-jwt";
import { getAccountById } from "../database/dao/account.dao";
import { getAllRefreshTokensForAccount } from "../database/dao/refreshToken.dao";
import { Account } from "../database/models/Account";
import { Role } from "../enum/role.enum";
import { RequestWithUser } from "../interface/RequestWithUser.interface";

const secret: string = process.env.SECRET !== undefined ? process.env.SECRET : "YOLO";
if (secret === "YOLO") {
    throw new Error("secret not found in env file");
}

// const db = require("_helpers/db");

function authorize(roles: Role[] = []) {
    // roles param can be a single role string (e.g. Role.User or 'User')
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === "string") {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        jwt({ secret, algorithms: ["HS256"] }),

        // authorize based on user role
        async (request: RequestWithUser, res: Response, next: NextFunction) => {
            if (request.user === undefined) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const account: Account | null = await getAccountById(request.user.id);
            if (!account) return res.status(401).json({ message: "Unauthorized" });
            const refreshTokens = await getAllRefreshTokensForAccount(account.id);

            const validRoles = Object.values(Role);
            const acctRole: Role = account.role as Role;
            if (roles.length && !validRoles.includes(acctRole)) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: "Unauthorized" });
            }

            // authentication and authorization successful
            request.user.role = account.role;
            // req.user.ownsToken = token => !!refreshTokens.find((x: any) => x.token === token);
            request.user.ownsToken = (token: string) => !!refreshTokens.find((x: any) => x.token === token);
            next();
        },
    ];
}

export default authorize;
