import { isEmail } from "../../src/validationSchemas/schemas";
import { FAKE_ACCOUNT } from "../mocks/userCredentials";

describe("we test the validators on their own", () => {
    test("isEmail works for correct emails", () => {
        // https://en.wikipedia.org/wiki/Email_address#Local-part
        //         uppercase and lowercase Latin letters A to Z and a to z
        // digits 0 to 9
        // printable characters !#$%&'*+-/=?^_`{|}~
        // dot .
        const email1 = FAKE_ACCOUNT.email;
        const email2 = "realemail2022@gmail.com";
        const email3 = "barackobama2022@gmail.com";
        const email4 = "AAAAaaa000$@outlook.com";
        const email5 = "0123457896aA@outlook.com";
        const result1 = isEmail(email1);
        const result2 = isEmail(email2);
        const result3 = isEmail(email3);
        const result4 = isEmail(email4);
        const result5 = isEmail(email5);
        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(result3).toBe(true);
        expect(result4).toBe(true);
        expect(result5).toBe(true);
    });
    test("isEmail says invalid emails are false", () => {
        const notEmail1 = "fmdsafdsaf";
        const notEmail2 = "2039320aa@gmail";
        const notEmail3 = "@gmail.com";
        const notEmail4 = "..##@outlook.com";
        const notEmail5 = "####aaa@gmail_com";
        const notEmail6 = "alsoNotEmail@gmail";
        const result1 = isEmail(notEmail1);
        const result2 = isEmail(notEmail2);
        const result3 = isEmail(notEmail3);
        const result4 = isEmail(notEmail4);
        const result5 = isEmail(notEmail5);
        const result6 = isEmail(notEmail6);
        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(result3).toBe(false);
        expect(result4).toBe(false);
        expect(result5).toBe(false);
        expect(result6).toBe(false);
    });
});
