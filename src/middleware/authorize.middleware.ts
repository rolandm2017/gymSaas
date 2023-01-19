import { NextFunction, Request, Response } from "express";
import { expressjwt as jwt } from "express-jwt";
import dotenv from "dotenv";

import AccountDAO from "../database/dao/account.dao";
import { Account } from "../database/models/Account";
import { Role } from "../enum/role.enum";

dotenv.config({ path: "./.env" });

export const secret: string = process.env.SECRET !== undefined ? process.env.SECRET : "noSecretLoaded";
if (secret === "noSecretLoaded") {
    throw new Error("secret not found in env file");
}

const acctDAO = new AccountDAO();

function authorize(validRoles: Role[] = []) {
    // roles param can be a single role string (e.g. Role.User or 'User')
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof validRoles === "string") {
        validRoles = [validRoles];
    }

    return [
        jwt({
            secret, // authenticate JWT token and attach user to request object (req.user)
            algorithms: ["HS256"],
        }),

        // authorize based on user role
        async (request: Request, res: Response, next: NextFunction) => {
            // Note for Jason Watmore: If you're reading this, it looks like, at some point, express-jwt's devs changed things.
            // see https://stackoverflow.com/questions/34775687/express-jwt-setting-user-object-to-req-user-doc-instead-of-just-req-user
            // I discovered this while googling "jwt secret express jwt req.user"
            const acctInfo = request.auth;
            if (acctInfo?.acctId === undefined) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            request.user = {
                acctId: acctInfo.acctId,
            };
            const account: Account | null = await acctDAO.getAccountById(acctInfo.acctId);
            if (!account) return res.status(401).json({ message: "Unauthorized" });
            const acctRole: Role = account.role as Role;
            const rolesFoundOnRequest = validRoles.length;
            if (rolesFoundOnRequest && !validRoles.includes(acctRole)) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: "Unauthorized" });
            }

            // authentication and authorization successful
            request.user.role = account.role;
            next();
        },
    ];
}

export default authorize;
