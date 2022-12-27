/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverageFrom: ["src/**/*.ts", "src/components/*.ts", "!**/node_modules/**"],
};

// process.on("unhandledRejection", reason => {
//     console.log(reason); // log the reason including the stack trace
//     throw e;
// });
