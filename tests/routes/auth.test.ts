import { cookie } from "express-validator";
import request from "supertest";
import AccountDAO from "../../src/database/dao/account.dao";

import { app, server } from "../mocks/mockServer";
import { emails, passwords, badPasswords, tooShortPassword } from "../mocks/userCredentials";

const path = "/auth";

let TOKEN_COOKIES = "";
let ACCESS_TOKEN = "";

const validCredentials = {
    email: emails[0],
    password: passwords[0],
    confirmPassword: passwords[0],
    acceptTerms: true,
};

const invalidCredentials1 = {
    email: emails[0],
    password: passwords[0],
    confirmPassword: passwords[0],
    acceptTerms: false, // false is a problem
};

const invalidCredentials2 = {
    email: emails[0],
    password: passwords[0],
    confirmPassword: passwords[1], // if pw no match, problem!
    acceptTerms: true,
};

const invalidCredentials3 = {
    email: "notAnEmail",
    password: passwords[1],
    confirmPassword: passwords[1],
    acceptTerms: true,
};

let acctDAO: AccountDAO = new AccountDAO();

beforeAll(async () => {
    console.log("\n====\n====\nstarting app...\n===\n===");
    await app.connectDB();
    await app.dropTable("account");
});

afterAll(async () => {
    console.log("***\n***\n***\nclosing app...");
    await app.closeDB();
});

function logTime(a: number) {
    var d = new Date(); // for now
    console.log(
        a.toString() +
            " - " +
            d.getHours() +
            ":" + // => 9
            d.getMinutes() +
            ":" + // =>  30
            d.getSeconds(),
    ); // => 51
}

describe("Test auth controller", () => {
    describe("POST /register", () => {
        test("responds with success msg if body is populated properly", async () => {
            const res = await request(server).post(`${path}/register`).set("origin", "testSuite").send(validCredentials);
            expect(res.body.message).toBe("Registration successful, please check your email for verification instructions");
            expect(res.body.accountDetails.email).toBe(validCredentials.email);
            expect(res.body.accountDetails.isVerified).toBe(null);
        });
        test("rejects for malformed inputs and edge cases", async () => {
            await request(server).post(`${path}/register`).expect(400);
            await request(server).post(`${path}/register`).send(invalidCredentials1).expect(400);
            await request(server).post(`${path}/register`).send(invalidCredentials2).expect(400);
            await request(server).post(`${path}/register`).send(invalidCredentials3).expect(400);
        });
    });
    describe("POST /authenticate", () => {
        // authentic
        test("responds with success msg if body is populated properly", () => {
            //
        });
        test("malformed and edge cases are rejected", () => {
            //
        });
    });
    describe("Complete user registration flow & password reset", () => {
        jest.setTimeout(1000 * 240);
        test("works - this is integration", async () => {
            logTime(1);
            const credentials = { ...validCredentials };
            credentials.email = "foobarbazgirl@gmail.com";
            const pw = "catsDOGS444%%";
            credentials.password = pw;
            credentials.confirmPassword = pw;
            const res = await request(server).post(`${path}/register`).set("origin", "testSuite").send(credentials);
            expect(res.body.message).toBe("Registration successful, please check your email for verification instructions");
            expect(res.body.accountDetails.email).toBe(credentials.email);
            expect(res.body.accountDetails.isVerified).toBe(null);
            logTime(2);
            // get token via cheater method b/c we don't have email set up => verify ownership of account
            const madeAcct = await acctDAO.getAccountByEmail(credentials.email);
            const token = madeAcct[0].verificationToken;
            const payload = { token: token };
            const acctVerificationRes = await request(server).post(`${path}/verify_email`).send(payload);
            logTime(2.5);
            expect(acctVerificationRes.body.message).toBe("Verification successful, you can now login");
            logTime(3);
            // now we expect logging in with this new account to "just work"
            const loginPayload = { email: credentials.email, password: pw };
            const authenticationRes = await request(server).post(`${path}/authenticate`).send(loginPayload);
            expect(authenticationRes.body.email).toBe(credentials.email);
            expect(authenticationRes.body.id).toBeDefined();
            expect(authenticationRes.body.isVerified).toBe(true); // the goods! verification successful.
            logTime(4);
            // now try changing the password
            const newPw = pw + "str";
            const emailChangerPayload = {
                email: credentials.email,
                oldPw: pw,
                newPw: newPw,
                confirmNewPw: newPw,
            };
            const changedPwRes = await request(server).post(`${path}/update_password`).send(emailChangerPayload);
            expect(changedPwRes.body.message).toBe("Password updated!");
            logTime(5);
        });
    });
});
