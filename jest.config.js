/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    globalSetup: "./tests/jest-setup.ts",
    // globalTeardown: "." // maybe have separate teardown file?
};
