// packages
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import { Model, Sequelize } from "sequelize";

// import App from "../../src/app"; // this tests server is *different* from the dev server, but close to it.
import GooglePlacesController from "../../src/controllers/googlePlaces.controller";
import ApartmentsController from "../../src/controllers/apartments.controller";
import HealthCheckController from "../../src/controllers/healthCheck.controller";
import AuthController from "../../src/controllers/auth.controller";

import initModels from "../../src/database/models/init-models";
import errorHandler from "../../src/middleware/error.middleware";

import { TEST_DB_HOST, TEST_DB_NAME, TEST_DB_PASSWORD, TEST_DB_PORT, TEST_DB_USER } from "../config";
import AuthService from "../../src/service/auth.service";
import EmailService from "../../src/service/email.service";
import AccountUtil from "../../src/util/accountUtil";
import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";
import { Account } from "../../src/database/models/Account";
import { testDatabase } from "../database/Database";

class App {
    public app: Application;
    public port: number;
    private models: any;

    public static Database: Sequelize;
    public dbConnOpen: boolean = false;

    private static initDB() {
        // intialize testing database
        App.Database = testDatabase;
    }

    constructor(appInit: { port: number; middlewares: any; controllers: any }) {
        this.app = express();
        this.port = appInit.port;
        this.app.use(cors());
        this.app.use(morgan("dev"));
        this.app.use(cookieParser());

        this.middlewares(appInit.middlewares);
        // this.app.use(ErrorMiddleware.handleRouteErrors); // this will catch any error thrown routes
        this.routes(appInit.controllers);
        this.app.use(errorHandler);
    }

    public listen() {
        this.app.listen(this.port, async () => {
            console.log(`App has started on port ${this.port}`);
        });
    }

    public async connectDB() {
        if (this.dbConnOpen) return;
        App.initDB();
        await App.Database.authenticate();
        console.log("Database Connection Established");
        await initModels(App.Database);
        // this.models = models;
        await App.Database.sync({ force: true });
        // await App.Database.drop();
        console.log("Database Sync");
        this.dbConnOpen = true;
    }

    public async dropAllTables() {
        if (!this.dbConnOpen) return;
        console.log("Dropping all tables...");
        await App.Database.drop();
        // fixme: Never managed to make this work
        await App.Database.sync({ force: true });
    }

    public async dropTable(tableName: string): Promise<void> {
        // await table.sync({ force: true })
        if (tableName === "account") {
            await Account.destroy({ where: {} });
        }
    }

    public async closeDB() {
        if (this.dbConnOpen) {
            await App.Database.close();
            this.dbConnOpen = false;
            console.log("db connection closed!");
        }
    }

    public getServer() {
        return this.app;
    }

    private middlewares(middlewares: any) {
        middlewares.forEach((middleware: any) => {
            // console.log("adding middleware...");
            this.app.use(middleware);
        });
    }

    private routes(controllers: any) {
        controllers.forEach((controller: any) => {
            // console.log(controller.path, "... is running");
            this.app.use(controller.path, controller.router);
        });
    }
}

const port = parseInt(process.env.PORT!, 10);
console.log("hello world!", port);

const acctDAO = new AccountDAO();
const emailService = new EmailService(acctDAO, "testing");
const accountUtil = new AccountUtil();
const resetTokenDAO = new ResetTokenDAO();
const a = new AuthService(emailService, accountUtil, acctDAO, resetTokenDAO);

export const app = new App({
    port: port || 8000,

    controllers: [new AuthController(a), new GooglePlacesController(), new ApartmentsController(), new HealthCheckController()],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});

export const server = app.getServer();
