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
import WishController from "../../src/controllers/wish.controller";
import ProfileController from "../../src/controllers/profile.controller";
import FeedbackController from "../../src/controllers/feedback.controller";

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
import WishService from "../../src/service/wish.service";
import FeedbackService from "../../src/service/feedback.service";
import ProfileService from "../../src/service/profile.service";
import LocationDiscoveryService from "../../src/service/locationDiscovery.service";
import ScraperConnectionFactory from "../../src/scrapers/connectionFactory";
// model
import { Account } from "../../src/database/models/Account";
import { ResetToken } from "../../src/database/models/ResetToken";
import { Task } from "../../src/database/models/Task";
import { City, CityCreationAttributes } from "../../src/database/models/City";
import { Housing } from "../../src/database/models/Housing";
import { Batch } from "../../src/database/models/Batch";
import { State } from "../../src/database/models/State";
import { Profile } from "../../src/database/models/Profile";
import { Wish } from "../../src/database/models/Wish";
import { Feedback } from "../../src/database/models/Feedback";
// dao
import AccountDAO from "../../src/database/dao/account.dao";
import ResetTokenDAO from "../../src/database/dao/resetToken.dao";
import BatchDAO from "../../src/database/dao/batch.dao";
import StateDAO from "../../src/database/dao/state.dao";
import CityDAO from "../../src/database/dao/city.dao";
import HousingDAO from "../../src/database/dao/housing.dao";
import TaskDAO from "../../src/database/dao/task.dao";
import GymDAO from "../../src/database/dao/gym.dao";
import FeedbackDAO from "../../src/database/dao/feedback.dao";
import ProfileDAO from "../../src/database/dao/profile.dao";
import WishDAO from "../../src/database/dao/wish.dao";
// misc
import AccountUtil from "../../src/util/accountUtil";
import sendEmail from "../../src/util/sendEmail";
import testDatabase from "../database/Database";

import { SEED_USERS } from "../../src/seed/seedUsers";
import { SEED_STATES } from "../../src/seed/seedStates";
import { SEED_CITIES } from "../../src/seed/seedCities";
import GooglePlacesAPI from "../../src/api/googlePlaces";
import RefreshTokenDAO from "../../src/database/dao/refreshToken.dao";
import { Gym } from "../../src/database/models/Gym";

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

        try {
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
            const feedbackDAO = new FeedbackDAO();
            const cacheService = new CacheService(cityDAO, batchDAO, feedbackDAO);
            cacheService.initBatchCache();

            // console.log("Database Sync");
            this.dbConnOpen = true;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    public async dropTable(
        tableName: "account" | "resetToken" | "task" | "city" | "housing" | "batch" | "profile" | "wish" | "feedback" | "gym",
    ): Promise<void> {
        // await table.sync({ force: true })
        try {
            if (tableName === "account") {
                await Account.destroy({ where: {} });
            } else if (tableName === "resetToken") {
                await ResetToken.destroy({ where: {} });
            } else if (tableName === "task") {
                await Task.destroy({ where: {} });
            } else if (tableName === "city") {
                await City.destroy({ where: {} });
            } else if (tableName === "housing") {
                await Housing.destroy({ where: {} });
            } else if (tableName === "batch") {
                await Batch.destroy({ where: {} });
            } else if (tableName === "profile") {
                await Profile.destroy({ where: {} });
            } else if (tableName === "wish") {
                await Wish.destroy({ where: {} });
            } else if (tableName === "feedback") {
                await Feedback.destroy({ where: {} });
            } else if (tableName === "gym") {
                await Gym.destroy({ where: {} });
            }
        } catch (err) {
            console.log(err);
            throw err;
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

// initialize dao
const acctDAO = new AccountDAO();
const stateDAO = new StateDAO();
const cityDAO = new CityDAO();
const batchDAO = new BatchDAO();
const taskDAO = new TaskDAO();
const housingDAO = new HousingDAO(stateDAO, cityDAO);
const resetTokenDAO = new ResetTokenDAO(acctDAO);
const refreshTokenDAO = new RefreshTokenDAO();
const gymDAO = new GymDAO();
const feedbackDAO = new FeedbackDAO();
const wishDAO = new WishDAO();
const profileDAO = new ProfileDAO();
// had to wait to do this

const scraperConnectionFactory: ScraperConnectionFactory = new ScraperConnectionFactory(taskDAO);

// misc
const googlePlacesAPI = new GooglePlacesAPI();
const locationDiscoveryService: LocationDiscoveryService = new LocationDiscoveryService();
const accountUtil = new AccountUtil(refreshTokenDAO);
// services
const emailService = new EmailService(sendEmail, "development");
const adminService = new AdminService(acctDAO);
const scraperService = new ScraperService(scraperConnectionFactory, locationDiscoveryService);
const authService = new AuthService(emailService, accountUtil, acctDAO, profileDAO, resetTokenDAO, refreshTokenDAO);
const cacheService = new CacheService(cityDAO, batchDAO, feedbackDAO);
const housingService = new HousingService(housingDAO, gymDAO, acctDAO, profileDAO, cacheService, scraperService);
const taskQueueService = new TaskQueueService(housingDAO, taskDAO, cityDAO, batchDAO, cacheService);
const gymService = new GymService(gymDAO, cacheService, googlePlacesAPI);
const feedbackService = new FeedbackService(cacheService, feedbackDAO, profileDAO);
const wishService = new WishService(wishDAO, profileDAO);
const profileService = new ProfileService(profileDAO, acctDAO, housingDAO, gymDAO);

export const app = new App({
    port: port || 8000,

    controllers: [
        new AdminController(adminService, taskQueueService, housingService),
        new AuthController(authService),
        new GymsController(gymService),
        new HousingController(housingService, scraperService),
        new TaskQueueController(taskQueueService, scraperService, cacheService),
        new FeedbackController(feedbackService),
        new WishController(wishService),
        new ProfileController(profileService),
    ],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});

export const server = app.getServer();
