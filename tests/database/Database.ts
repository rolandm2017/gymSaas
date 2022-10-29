import { Sequelize } from "sequelize";

import { TEST_DB_HOST, TEST_DB_NAME, TEST_DB_PASSWORD, TEST_DB_PORT, TEST_DB_USER } from "../config";

// const testDatabase = new Sequelize({
//     dialect: "postgres",
//     host: TEST_DB_HOST,
//     port: TEST_DB_PORT,
//     database: TEST_DB_NAME,
//     username: TEST_DB_USER,
//     password: TEST_DB_PASSWORD,
//     // logging: console.log,
// });

// const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
//     host: dbHost,
//     dialect: dbDriver,
// });

const testDatabase = new Sequelize(TEST_DB_NAME, TEST_DB_USER, TEST_DB_PASSWORD, {
    host: TEST_DB_HOST,
    dialect: "postgres",
    logging: console.log,
});

export default testDatabase;
