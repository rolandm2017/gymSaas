import bcrypt from "bcrypt";

// confirming that I know how to use bcrypt.

describe("confirms that I know how to use bcrypt", () => {
    test("I can create a hashed pw", async () => {
        const s = "someInputPw21";
        const hashed = bcrypt.hashSync(s, 10);
        expect(hashed.length).toBeGreaterThan(s.length);
    });
    test("I can create a hashed pw and then compare the hash to the input pw", async () => {
        const pw = "narniaLion4044$";
        const hashed = bcrypt.hashSync(pw, 10);
        const correctInputPw = bcrypt.compareSync(pw, hashed);
        expect(correctInputPw).toBe(true);
    });
});
