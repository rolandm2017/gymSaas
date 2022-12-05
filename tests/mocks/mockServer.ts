// packages
import express, { Application } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import { Model, Sequelize } from "sequelize";
// controller
import GymsController from "../../src/controllers/gyms.controller";
import HousingController from "../../src/controllers/housing.controller";
import AuthController from "../../src/controllers/auth.controller";
import TaskQueueController from "../../src/controllers/taskQueue.controller";
import AdminController from "../../src/controllers/admin.controller";

import initModels from "../../src/database/models/init-models";
import errorHandler from "../../src/middleware/error.middleware";

import { TEST_DB_HOST, TEST_DB_NAME, TEST_DB_PASSWORD, TEST_DB_PORT, TEST_DB_USER } from "../config";
// service
import AuthService from "../../src/service/auth.service";
import EmailService from "../../src/service/email.service";
import HousingService from "../../src/service/housing.service";
import AdminService from "../../src/service/admin.service";
import TaskQueueService from "../../src/service/taskQueue.service";
import ScraperService from "../../src/service/scraper.service";
import CacheService from "../../src/service/cache.service";
import GymService from "../../src/service/gym.service";
// model
import { Account } from "../../src/database/models/Account";
import { ResetToken } from "../../src/database/models/ResetToken";
import { Task } from "../../src/database/models/Task";
import { City, CityCreationAttributes } from "../../src/database/models/City";
import { Housing } from "../../src/database/models/Housing";
import { Batch } from "../../src/database/models/Batch";
import { State } from "../../src/database/models/State";
// dao
import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";
import BatchDAO from "../../src/database/dao/batch.dao";
import StateDAO from "../../src/database/dao/state.dao";
import CityDAO from "../../src/database/dao/city.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import GymDAO from "../../src/database/dao/gym.dao";
// misc
import AccountUtil from "../../src/util/accountUtil";
import testDatabase from "../database/Database";

import { SEED_USERS } from "../../src/seed/seedUsers";
import { SEED_STATES } from "../../src/seed/seedStates";
import { SEED_CITIES } from "../../src/seed/seedCities";
import GooglePlacesAPI from "../../src/api/googlePlaces";
import LocationDiscoveryService from "../../src/service/locationDiscovery.service";
import ScraperConnectionFactory from "../../src/scrapers/connectionFactory";

class App {
    public app: Application;
    public port: number;

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
        await initModels(App.Database);
        await App.Database.sync({ force: true });
        await this.seedDb();
        // restore cache of batch ids from db
        const batchDAO = new BatchDAO();
        const cityDAO = new CityDAO();
        const cacheService = new CacheService(cityDAO, batchDAO);
        cacheService.initBatchCache();

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
        for (const user of SEED_USERS) {
            const found = await Account.findOne({ where: { email: user.email } });
            if (found) continue;
            Account.create(user);
        }
        for (const state of SEED_STATES) {
            const found = await State.findOne({ where: state });
            if (found) continue;
            State.create(state);
        }
        for (const city of SEED_CITIES) {
            // check if city is seeded into db before trying to add a dupe
            const found = await City.findOne({ where: { cityName: city.cityName } });
            if (found) continue;
            City.create(city);
        }
    }
}

const port = parseInt(process.env.PORT!, 10);

// misc
const accountUtil = new AccountUtil();
const googlePlacesAPI = new GooglePlacesAPI();
const locationDiscoveryService: LocationDiscoveryService = new LocationDiscoveryService();

// initialize dao
const acctDAO = new AccountDAO();
const stateDAO = new StateDAO();
const cityDAO = new CityDAO();
const batchDAO = new BatchDAO();
const taskDAO = new TaskDAO();
const housingDAO = new HousingDAO(stateDAO, cityDAO);
const resetTokenDAO = new ResetTokenDAO(acctDAO);
const gymDAO = new GymDAO();
// had to wait to do this
const scraperConnectionFactory: ScraperConnectionFactory = new ScraperConnectionFactory(taskDAO);
// services
const adminService = new AdminService(acctDAO);
const scraperService = new ScraperService(scraperConnectionFactory, locationDiscoveryService);
const emailService = new EmailService(acctDAO, "testing");
const authService = new AuthService(emailService, accountUtil, acctDAO, resetTokenDAO);
const cacheService = new CacheService(cityDAO, batchDAO);
const housingService = new HousingService(housingDAO, gymDAO, cacheService);
const taskQueueService = new TaskQueueService(cityDAO, housingDAO, batchDAO, taskDAO, cacheService);
const gymService = new GymService(gymDAO, cacheService, googlePlacesAPI);

export const app = new App({
    port: port || 8000,

    controllers: [
        new AdminController(adminService, taskQueueService, housingService),
        new AuthController(authService),
        new GymsController(gymService),
        new HousingController(housingService, scraperService),
        new TaskQueueController(taskQueueService, scraperService, cacheService),
    ],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});

export const server = app.getServer();
