import { createAccount, getAccountByEmail } from "../../src/database/dao/account.dao";

import crypto from "crypto";

// req fields as of oct 17

// id: number;
// email: string;
// passwordHash: string;
// isVerified: boolean;
// verificationToken: string;
// verified: number;
// updated: number;
// role: string;

var randomChars = crypto.randomBytes(10).toString("hex");
const randomId = Math.floor(Math.random() * 1000000) + 100000; // add 100k because we never expect that many users

const FAKE_ACCOUNT = {
    id: randomId,
    email: randomChars.toString() + "@gmail.com",
    passwordHash: randomChars,
    isVerified: true,
    verificationToken: "asdfadf",
    verified: 1000,
    updated: 1000,
    role: "User",
    passwordReset: 999,
};

describe("account DAO", () => {
    test("i can create an account and then find it in the db", async () => {
        const created = await createAccount(FAKE_ACCOUNT);
        expect(getAccountByEmail(FAKE_ACCOUNT.email)).toEqual(
            expect.objectContaining({
                id: randomId,
                email: FAKE_ACCOUNT.email,
            }),
        );
    });
});
