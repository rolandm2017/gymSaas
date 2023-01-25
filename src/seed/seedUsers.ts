import RefreshTokenDAO from "../database/dao/refreshToken.dao";
import { AccountCreationAttributes } from "../database/models/Account";
import { Role } from "../enum/role.enum";
import AccountUtil from "../util/accountUtil";
import { FREE_CREDITS } from "../util/constants";

export const ADMIN_ACCT_PASSWORD = process.env.ADMIN_PASSWORD || "foo";

const refreshTokenDAO = new RefreshTokenDAO();

const pwHash = new AccountUtil(refreshTokenDAO).hash(ADMIN_ACCT_PASSWORD);

export const SEED_USERS: AccountCreationAttributes[] = [
    {
        email: "rolandmackintosh@outlook.com",
        name: "Roland Mackintosh",
        passwordHash: pwHash,
        isVerified: true,
        verificationToken: "foo",
        role: Role.Admin,
        passwordReset: 0,
        updated: 0,
        credits: FREE_CREDITS,
        ipAddress: "255.255.255.1",
    },
];
