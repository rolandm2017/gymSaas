import sendEmail from "../../src/util/sendEmail";

beforeAll(() => {
    console.warn("WARNING: This test will SEND an email.");
});

describe("send an email to my real email", () => {
    test("an email is sent", () => {
        //
        const myEmail = process.env.MY_EMAIL ? process.env.MY_EMAIL : "fail";
        if (myEmail == "fail") {
            throw Error("fail to load email from env");
        }
        const payload = { to: myEmail, subject: "Test email!", html: "foo!" };
        sendEmail(payload);
        expect(true).toBe(false); // intentional failure to highlight that the test has run.
    });
});
