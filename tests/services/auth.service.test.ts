import { cookie } from "express-validator";
import request from "supertest";
import { IAccount } from "../../src/interface/Account.interface";
import { IBasicDetails } from "../../src/interface/BasicDetails.interface.";
import { ISmallError } from "../../src/interface/SmallError.interface";
import AuthService from "../../src/service/auth.service";

import { server } from "../mocks/server";

import { emails, passwords, badPasswords, tooShortPassword } from "../mocks/userCredentials";
const validCredentials = {
    email: emails[0],
    password: passwords[0],
    confirmPassword: passwords[0],
    acceptTerms: true,
};

const validIPAddress = "143.14.14.143";

const JWT_TOKEN_LENGTH = 40; // todo: add real length of jwt
const REFRESH_TOKEN_LENGTH = 40; // todo: get real length
const someOrigin = "whatever";

beforeAll(async () => {
    // todo: create an account to be authed as
    const authService = new AuthService();
    const emailBypass = { token: "" };
    function tokenReporter(token: string): void {
        emailBypass.token = token;
    }
    await authService.register(validCredentials, someOrigin, tokenReporter);
});

describe("test auth service on its own", () => {
    describe("sign up, log in, log out", () => {
        //
        test("you can log in with an account", async () => {
            // todo: beforeAll an account into the db so this test ISNT dependent on another test creating an account to auth as.
            const authService = new AuthService();
            const account: IBasicDetails | ISmallError = await authService.authenticate(
                validCredentials.email,
                validCredentials.password,
                validIPAddress,
            );
            if ("email" in account) {
                expect(account.email).toEqual(validCredentials.email);
                expect(account.jwtToken).toBeDefined();
                expect(account.jwtToken!.length).toEqual(JWT_TOKEN_LENGTH);
                expect(account.refreshToken).toBeDefined();
                expect(account.refreshToken!.length).toEqual(REFRESH_TOKEN_LENGTH);
            } else {
                fail("it should not reach here");
            }
        });
        test("you can register an account", async () => {
            const authService = new AuthService();
            const registered: IBasicDetails | ISmallError = await authService.register(validCredentials, someOrigin);
            if ("email" in registered) {
                expect(registered.email).toEqual(validCredentials.email);
                expect(registered.jwtToken).toBeDefined();
                expect(registered.jwtToken!.length).toEqual(JWT_TOKEN_LENGTH);
                expect(registered.refreshToken).toBeDefined();
                expect(registered.refreshToken!.length).toEqual(REFRESH_TOKEN_LENGTH);
            } else {
                fail("it should not reach here");
            }
        });
    });

    describe("refresh tokens work as intended", () => {
        //
    });

    describe("password reset flow works, minus the email part that we won't test", () => {
        // todo: use callback to grab a bool "yes we got to the end of the email flow"
    });
});
