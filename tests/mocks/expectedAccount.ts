import { Account } from "../../src/database/models/Account";

const expectedAccount: Account = {
    acctId: 999999,
    email: "someEmail@gmail.com",
    passwordHash: "catsjfpdsjafdsaofdsfa",
    isVerified: true,
    verificationToken: "adfaodipfsaf",
    verified: 9409254384,
    updated: 24332,
    role: "User",
    // many fields missing (intentionally)
} as unknown as Account;

export default expectedAccount;
