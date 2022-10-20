import { app } from "./mocks/server";

module.exports = async () => {
    console.log("jest-setup file");
    // console.log("\n=====\n====\n====\nI'll be called first before any test cases run");
    // beforeAll(async () => {
    //     console.log("\n=====\n====\n====\nIn before all, 6rm");
    //     await app.connectDB();
    // });
    // beforeEach(async () => {
    //     await app.connectDB();
    // });
};
