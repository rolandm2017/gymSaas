import { app } from "./mocks/server";

module.exports = async () => {
    console.log("I'll be called first before any test cases run");
    beforeAll(async () => {
        console.log("In before all, 6rm");
        await app.connectDB();
    });
    beforeEach(async () => {
        await app.connectDB();
    });
};
