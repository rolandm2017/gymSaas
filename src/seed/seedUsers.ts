import { Role } from "../enum/role.enum";
import AccountUtil from "../util/accountUtil";

const pwHash = new AccountUtil().hash("testTEST11!!");

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
