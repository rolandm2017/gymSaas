// import { Sequelize } from "sequelize";

// const Database = new Sequelize("postgres://user:pass@example.com:5432/dbname"); // Example for postgres

// export default Database;
import { Dialect, Sequelize } from "sequelize";

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbDriver = process.env.DB_DRIVER as Dialect;
const dbPassword = process.env.DB_PASSWORD;
console.log(dbName, dbUser, dbDriver, "adsfadsfsadf");

const sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, {
    // host: dbHost,
    dialect: dbDriver,
});

export default sequelizeConnection;
