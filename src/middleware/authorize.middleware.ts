import { NextFunction, Request, Response } from "express";
import { expressjwt as jwt } from "express-jwt";
import AccountDAO from "../database/dao/account.dao";
import RefreshTokenDAO from "../database/dao/refreshToken.dao";
import { Account } from "../database/models/Account";
import { Role } from "../enum/role.enum";
import { RequestWithUser } from "../interface/RequestWithUser.interface";

import dotenv from "dotenv";
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
        // authenticate JWT token and attach user to request object (req.user)
        jwt({
            secret,
            algorithms: ["HS256"],
        }),

        // authorize based on user role
        async (request: RequestWithUser, res: Response, next: NextFunction) => {
            // Note for Jason Watmore: If you're reading this, it looks like, at some point, express-jwt's devs changed things.
            // see https://stackoverflow.com/questions/34775687/express-jwt-setting-user-object-to-req-user-doc-instead-of-just-req-user
            // I discovered this while googling "jwt secret express jwt req.user"
            const acctInfo = request.auth;
            if (acctInfo?.acctId === undefined) {
                return res.status(401).json({ message: "Unauthorized - 031" });
            }
            request.user = {
                acctId: acctInfo.acctId,
                role: "", // temp to satisfy ts
            };
            console.log("50rm");
            const account: Account | null = await acctDAO.getAccountById(acctInfo.acctId);
            if (!account) return res.status(401).json({ message: "Unauthorized - 034" });
            console.log("53rm");
            const refreshTokens = await rtDAO.getAllRefreshTokensForAccount(account.acctId);
            console.log("58rm");

            const validRoles = Object.values(Role);
            const acctRole: Role = account.role as Role;
            console.log(acctRole, "040rm");
            const rolesFoundOnRequest = roles.length;
            if (rolesFoundOnRequest && !validRoles.includes(acctRole)) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: "Unauthorized - 041" });
            }

            // authentication and authorization successful
            request.user.role = account.role;
            // req.user.ownsToken = token => !!refreshTokens.find((x: any) => x.token === token);
            request.user.ownsToken = (token: string) => !!refreshTokens.find((x: any) => x.token === token); // fixme: whats this do?
            next();
        },
    ];
}

export default authorize;
