import { Role } from "../enum/role.enum";
import AccountUtil from "../util/accountUtil";

export const ADMIN_ACCT_PASSWORD = "testTEST11!!";

const pwHash = new AccountUtil().hash(ADMIN_ACCT_PASSWORD);

export const SEED_USERS = [
    {
        email: "rolandmackintosh@outlook.com",
        passwordHash: pwHash,
        isVerified: true,
        verificationToken: "foo",
        role: Role.Admin,
        passwordReset: 0,
        updated: 0,
    },
];
