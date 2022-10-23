import { cookie } from "express-validator";
import request from "supertest";

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

beforeAll(async () => {
    console.log("\n====\n====\nstarting app...\n===\n===");
    await app.connectDB();
    await app.dropTable("account");
});

afterAll(async () => {
    console.log("***\n***\n***\nclosing app...");
    await app.closeDB();
});

describe("Test auth controller", () => {
    describe("/register", () => {
        describe("well formed", () => {
            test("POST /register responds with success msg if body is populated properly", async () => {
                await request(server)
                    .post(`${path}/register`)
                    .set("origin", "testSuite")
                    .send(validCredentials)
                    .end((err, res) => {
                        if (err) console.log(err);
                        //     expect({
                        //     message: "Registration successful, please check your email for verification instructions",
                        // });
                        expect(res.body.message).toBe(
                            "Registration successful, please check your email for verification instructions",
                        );
                        expect(res.body.email).toBe(validCredentials.email);
                        expect(res.body.isVerified).toBe(false);
                    });
            });
        });
        describe("malformed", () => {
            test("POST /register, malformed and edge cases", async () => {
                await request(server).post(`${path}/register`).expect(400);
                await request(server).post(`${path}/register`).send(invalidCredentials1).expect(400);
                await request(server).post(`${path}/register`).send(invalidCredentials2).expect(400);
                await request(server).post(`${path}/register`).send(invalidCredentials3).expect(400);
            });
        });
    });
});
