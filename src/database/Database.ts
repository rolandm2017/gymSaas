import dotenv from "dotenv";
import { Dialect, Sequelize } from "sequelize";

dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbDriver = process.env.DB_DRIVER as Dialect;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;
const dbAddress = process.env.DB_ADDRESS;

// console.log(dbName, dbUser, dbHost, dbDriver, ":: connection specifications");

const sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: dbDriver,
    logging: false,
});

export default sequelizeConnection;
