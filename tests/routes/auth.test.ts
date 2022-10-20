import { cookie } from "express-validator";
import request from "supertest";

import { app, server } from "../mocks/server";
import { emails, makeValidEmail, passwords, badPasswords, tooShortPassword } from "../mocks/userCredentials";

const path = "/auth";
const timestamp = Date.now();
const TEST_SIGNUP = {
    email: "test" + timestamp + "@newworld.inch",
    password: "Test@" + timestamp,
    re_password: "Test@" + timestamp,
};

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
    validCredentials.email = makeValidEmail(); // fresh every time
});

afterAll(async () => {
    console.log("***\n***\n***\nclosing app...");
    await app.dropAllTables();
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
                    .expect({ message: "Registration successful, please check your email for verification instructions" });
            });
        });
        test("POST /register, malformed and edge cases", async () => {
            await request(server).post(`${path}/register`).expect(400);
            await request(server).post(`${path}/register`).send(invalidCredentials1).expect(400);
            await request(server).post(`${path}/register`).send(invalidCredentials2).expect(400);
            await request(server).post(`${path}/register`).send(invalidCredentials3).expect(400);
        });
    });
});
