import { cookie } from "express-validator";
import request from "supertest";

import { server } from "../mocks/server";
import { REGISTERED_USER_ATTRIBUTES, REGISTERED_USER_CREDENTIALS } from "../mocks/userCredentials";

const path = "/auth";
const timestamp = Date.now();
const TEST_SIGNUP = {
    username: "testUser-" + timestamp,
    email: "test" + timestamp + "@newworld.inch",
    phone_number: "+12345678910",
    password: "Test@" + timestamp,
    re_password: "Test@" + timestamp,
    first_name: "laddi",
    last_name: "sidhu",
    date_of_birth: new Date().toISOString(), // optional
    gender: "Male", // optional
};

let TOKEN_COOKIES = "";
let ACCESS_TOKEN = "";
beforeAll(async () => {
    const tokenResponse = await request(server)
        .post(`${path}/signin`)
        .set("Content-type", "application/json")
        .send(REGISTERED_USER_CREDENTIALS)
        .expect(200);
    TOKEN_COOKIES = tokenResponse.headers["set-cookie"];
    ACCESS_TOKEN = tokenResponse.body.access_token;
});
