import sendEmail, { verifySMTPConnection } from "../../src/util/sendEmail";

beforeAll(() => {
    console.warn("WARNING: This test will SEND an email.");
});

describe("send an email to my real email", () => {
    test("an email is sent", async () => {
        //
        if (process.env.ENABLE_EMAIL_TESTS) {
            const connectionEstablished = await verifySMTPConnection();
            expect(connectionEstablished).toBe(true);
            const myEmail = process.env.MY_EMAIL ? process.env.MY_EMAIL : "fail";
            const senderEmail = process.env.PRIVATE_EMAIL;
            expect(senderEmail).toBeDefined();
            console.log("TESTS 14rm");
            if (myEmail == "fail") {
                throw Error("fail to load email from env");
            }
            const payload = { from: senderEmail, to: myEmail, subject: "Test email!", html: "foo!" };
            console.log("TESTS 19rm");
            sendEmail(payload);
            console.warn("You just sent a real email");
            expect(true).toBe(false); // intentional failure to highlight that the test has run.
        } else {
            expect(true).toBe(true); // do not run test
        }
    }, 40000);
});
