import { cookie } from "express-validator";
import request from "supertest";

import server from "../mocks/server";
import { emails, passwords, badPasswords, tooShortPassword } from "../mocks/userCredentials";

const path = "/auth";
const timestamp = Date.now();
const TEST_SIGNUP = {
    email: "test" + timestamp + "@newworld.inch",
    password: "Test@" + timestamp,
    re_password: "Test@" + timestamp,
};

let TOKEN_COOKIES = "";
let ACCESS_TOKEN = "";
// beforeAll(async () => {
//     const tokenResponse = await request(server)
//         .post(`${path}/signin`)
//         .set("Content-type", "application/json")
//         .send(REGISTERED_USER_CREDENTIALS)
//         .expect(200);
//     TOKEN_COOKIES = tokenResponse.headers["set-cookie"];
//     ACCESS_TOKEN = tokenResponse.body.access_token;
// });

const validCredentials = {
    email: emails[0],
    password: passwords[0],
    confirmPassword: passwords[0],
    acceptTerms: true,
};

describe("Test auth controller", () => {
    describe("/register", () => {
        describe("well formed", () => {
            test("POST /register responds with ... if body is populated properly", async () => {
                await request(server)
                    .post(`${path}/register`)
                    .send(validCredentials)
                    .expect({ message: "Registration successful, please check your email for verification instructions" });
            });
        });
        test("POST /register, malformed and edge cases", async () => {
            await request(server).post(`${path}/register`).expect(400);
            //
        });
    });
});
