import { Sequelize } from "sequelize";

import { TEST_DB_HOST, TEST_DB_NAME, TEST_DB_PASSWORD, TEST_DB_PORT, TEST_DB_USER } from "../config";

const testDatabase = new Sequelize(TEST_DB_NAME, TEST_DB_USER, TEST_DB_PASSWORD, {
    host: TEST_DB_HOST,
    dialect: "postgres",
    logging: false,
});

export default testDatabase;
