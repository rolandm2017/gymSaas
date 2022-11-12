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
import TaskQueueController from "../../src/controllers/taskQueue.controller";

import initModels from "../../src/database/models/init-models";
import errorHandler from "../../src/middleware/error.middleware";

import { TEST_DB_HOST, TEST_DB_NAME, TEST_DB_PASSWORD, TEST_DB_PORT, TEST_DB_USER } from "../config";
// service
import AuthService from "../../src/service/auth.service";
import EmailService from "../../src/service/email.service";
import ApartmentService from "../../src/service/apartment.service";

import AccountUtil from "../../src/util/accountUtil";
import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";
import { Account } from "../../src/database/models/Account";
import testDatabase from "../database/Database";
import { ResetToken } from "../../src/database/models/ResetToken";
import { Task } from "../../src/database/models/Task";
import { City } from "../../src/database/models/City";
import { Housing } from "../../src/database/models/Housing";
import TaskQueueService from "../../src/service/taskQueue.service";
import CityDAO from "../../src/database/dao/city.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import { Batch } from "../../src/database/models/Batch";

import { SEED_CITIES } from "../../src/seed/seedCities";
import ScraperService from "../../src/service/scraper.service";
import CacheService from "../../src/service/cache.service";
import BatchDAO from "../../src/database/dao/batch.dao";

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
        // this.seedDb();
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
        // console.log("Database Connection Established");
        await App.Database.drop();
        await App.Database.sync({ force: true });
        await initModels(App.Database);
        await this.seedDb();
        // console.log("Database Sync");
        this.dbConnOpen = true;
    }

    public async dropAllTables() {
        if (!this.dbConnOpen) return;
        console.log("Dropping all tables...");
        // await App.Database.drop();
        // fixme: Never managed to make this work
        await App.Database.sync({ force: true });
    }

    public async dropTable(tableName: "account" | "resetToken" | "task" | "city" | "housing" | "batch"): Promise<void> {
        // await table.sync({ force: true })
        if (tableName === "account") {
            await Account.destroy({ where: {} });
        }
        if (tableName === "resetToken") {
            await ResetToken.destroy({ where: {} });
        }
        if (tableName === "task") {
            await Task.destroy({ where: {} });
        }
        if (tableName === "city") {
            await City.destroy({ where: {} });
        }
        if (tableName === "housing") {
            await Housing.destroy({ where: {} });
        }
        if (tableName === "batch") {
            await Batch.destroy({ where: {} });
        }
    }

    public async closeDB() {
        if (this.dbConnOpen) {
            await App.Database.close();
            this.dbConnOpen = false;
            // console.log("db connection closed!");
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

    public async seedDb() {
        for (const city of SEED_CITIES) {
            // check if city is seeded into db before trying to add a dupe
            const found = await City.findOne({ where: city });
            if (found) continue;
            City.create(city);
        }
    }
}

const port = parseInt(process.env.PORT!, 10);

// initialize dao
const batchDAO = new BatchDAO();
const cityDAO = new CityDAO();
const housingDAO = new HousingDAO();
const taskDAO = new TaskDAO();
const acctDAO = new AccountDAO();
const accountUtil = new AccountUtil();
const resetTokenDAO = new ResetTokenDAO(acctDAO);
// services
const apartmentService = new ApartmentService(housingDAO);
const scraperService = new ScraperService();
const emailService = new EmailService(acctDAO, "testing");
const a = new AuthService(emailService, accountUtil, acctDAO, resetTokenDAO);
const taskQueueService = new TaskQueueService(cityDAO, housingDAO, taskDAO);
const cacheService = new CacheService(cityDAO, batchDAO);

export const app = new App({
    port: port || 8000,

    controllers: [
        new AuthController(a),
        new GooglePlacesController(),
        new ApartmentsController(apartmentService, scraperService),
        new HealthCheckController(),
        new TaskQueueController(taskQueueService, scraperService, cacheService),
    ],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});

export const server = app.getServer();
