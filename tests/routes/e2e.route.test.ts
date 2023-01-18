import request from "supertest";
import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";

import { emails, passwords, badPasswords, tooShortPassword } from "../mocks/userCredentials";
import { app, server } from "../mocks/mockServer";

let acctDAO: AccountDAO = new AccountDAO();

const validCredentials = {
    name: "Bobby Fisher",
    email: emails[0],
    password: passwords[0],
    confirmPassword: passwords[0],
    acceptsTerms: true,
};

beforeAll(async () => {
    await app.connectDB();
    await app.dropTable("account");
    await app.dropTable("profile");
    await app.dropTable("housing");
});

afterAll(async () => {
    await app.closeDB();
});

describe("full e2e test", () => {
    test("full e2e test!", async () => {
        // ** **
        // ** **
        // (1) pick some aps and gyms via ip =>
        // (2) register & authenticate =>
        // (3) view faved aps & gyms => add 3 more of each
        // (4) view updated faves => view the empty 'revealed url' list
        // (5) reveal url 3x => view the updated reveals list
        // (6) "visit" the revealed urls by logging them
        // ** **
        // ** **
        const authPath = "/auth";

        const credentials = { ...validCredentials };
        credentials.email = "foobarbazgirl2@gmail.com";
        const pw = "catsDOGS444%%";
        credentials.password = pw;
        credentials.confirmPassword = pw;
        const res = await request(server).post(`${authPath}/register`).set("origin", "testSuite").send(credentials);
        expect(res.body.message).toBe("Registration successful, please check your email for verification instructions");
        expect(res.body.accountDetails.email).toBe(credentials.email);
        expect(res.body.accountDetails.isVerified).toBe(false);
        // get token via cheater method b/c we don't have email set up => verify ownership of account
        const madeAcct = await acctDAO.getAccountByEmail(credentials.email);
        const token = madeAcct[0].verificationToken;
        const payload = { token: token };
        const acctVerificationRes = await request(server).post(`${authPath}/verify-email`).send(payload);
        expect(acctVerificationRes.body.message).toBe("Verification successful, you can now login");
        // now we expect logging in with this new account to "just work"
        const loginPayload = { email: credentials.email, password: pw };
        const authenticationRes = await request(server).post(`${authPath}/authenticate`).send(loginPayload);
        expect(authenticationRes.body.email).toBe(credentials.email);
        expect(authenticationRes.body.acctId).toBeDefined();
        expect(authenticationRes.body.isVerified).toBe(true); // the goods! verification successful.
        console.log(authenticationRes.body, "120rm");
        expect(authenticationRes.body.name).toBeDefined();
        expect(authenticationRes.body.name).toBe(validCredentials.name); // name exists!
        // check header for jwt and refresh token
        const jwtToken = authenticationRes.body.jwtToken;
        expect(jwtToken).toBeDefined();
        expect(jwtToken.length).toBeGreaterThan(100);
        const refreshToken = authenticationRes.headers["set-cookie"][0];
        const refreshTokenString = refreshToken.split(";")[0].split("=")[1];
        expect(refreshTokenString).toBeDefined();
        expect(refreshTokenString.length).toBe(80);

        // ** Cool, we are now logged in.
    });
});
