import { createAccount, getAccountByEmail } from "../../src/database/dao/account.dao";

// req fields as of oct 17

// id: number;
// email: string;
// passwordHash: string;
// isVerified: boolean;
// verificationToken: string;
// verified: number;
// updated: number;
// role: string;

const FAKE_ACCOUNT = {
    id: 999999,
    email: "k@gmail.com",
    passwordHash: "foobarbaz",
    isVerified: true,
    verificationToken: "asdfadf",
    verified: 1000,
    updated: 1000,
    role: "User",
    passwordReset: 999,
};

describe("account DAO", () => {
    test("i can create an account", () => {
        expect(createAccount(FAKE_ACCOUNT)).toEqual(
            expect.objectContaining({
                id: 999999,
                email: FAKE_ACCOUNT.email,
            }),
        );
    });
});
