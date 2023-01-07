import { NextFunction, Request, Response } from "express";
import { expressjwt as jwt } from "express-jwt";
import dotenv from "dotenv";

import AccountDAO from "../database/dao/account.dao";
import RefreshTokenDAO from "../database/dao/refreshToken.dao";
import { Account } from "../database/models/Account";
import { Role } from "../enum/role.enum";
import { RequestWithUser } from "../interface/RequestWithUser.interface";

dotenv.config({ path: "./.env" });

const secret: string = process.env.SECRET !== undefined ? process.env.SECRET : "YOLO";
if (secret === "YOLO") {
    throw new Error("secret not found in env file");
}

const acctDAO = new AccountDAO();
const rtDAO = new RefreshTokenDAO();

function authorize(roles: Role[] = []) {
    // roles param can be a single role string (e.g. Role.User or 'User')
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === "string") {
        roles = [roles];
    }

    return [
        jwt({
            secret, // authenticate JWT token and attach user to request object (req.user)
            algorithms: ["HS256"],
        }),

        // authorize based on user role
        async (request: RequestWithUser, res: Response, next: NextFunction) => {
            const acctInfo = request.auth;
            if (acctInfo?.acctId === undefined) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            request.user = {
                acctId: acctInfo.acctId,
                role: "", // temp to satisfy ts
            };
            const account: Account | null = await acctDAO.getAccountById(acctInfo.acctId);
            if (!account) return res.status(401).json({ message: "Unauthorized" });
            const refreshTokens = await rtDAO.getAllRefreshTokensForAccount(account.acctId);

            const validRoles = Object.values(Role);
            const acctRole: Role = account.role as Role;
            const rolesFoundOnRequest = roles.length;
            if (rolesFoundOnRequest && !validRoles.includes(acctRole)) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: "Unauthorized" });
            }

            // authentication and authorization successful
            request.user.role = account.role;
            request.user.ownsToken = (token: string) => !!refreshTokens.find((x: any) => x.token === token); // fixme: whats this do?
            next();
        },
    ];
}

export default authorize;
