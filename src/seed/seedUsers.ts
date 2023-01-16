import RefreshTokenDAO from "../database/dao/refreshToken.dao";
import { Role } from "../enum/role.enum";
import AccountUtil from "../util/accountUtil";
import { FREE_CREDITS } from "../util/constants";

export const ADMIN_ACCT_PASSWORD = "testTEST11!!";

const refreshTokenDAO = new RefreshTokenDAO();

const pwHash = new AccountUtil(refreshTokenDAO).hash(ADMIN_ACCT_PASSWORD);

export const SEED_USERS = [
    {
        email: "rolandmackintosh@outlook.com",
        passwordHash: pwHash,
        isVerified: true,
        verificationToken: "foo",
        role: Role.Admin,
        passwordReset: 0,
        updated: 0,
        credits: FREE_CREDITS,
    },
];
