import express, { Application } from "express";
import passport from "passport";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import cookieSession from "cookie-session";
//
import initModels from "./database/models/init-models";
import Database from "./database/Database";
import errorHandler from "./middleware/error.middleware";

import { City } from "./database/models/City";
import { State } from "./database/models/State";
import { Account } from "./database/models/Account";

import { SEED_CITIES } from "./seed/seedCities";
import { SEED_STATES } from "./seed/seedStates";
import { SEED_USERS } from "./seed/seedUsers";
import CacheService from "./service/cache.service";
import CityDAO from "./database/dao/city.dao";
import BatchDAO from "./database/dao/batch.dao";
import { SEED_GYMS_CANADA } from "./seed/gyms";
import { Gym } from "./database/models/Gym";
import passportConfig from "./config/passportConfig";
import FeedbackDAO from "./database/dao/feedback.dao";
import { secret } from "./middleware/authorize.middleware";

class App {
    public app: Application;

    public port: number;

    constructor(appInit: { port: number; middlewares: any; controllers: any }) {
        this.app = express();
        this.port = appInit.port;
        this.app.use(
            cors({
                origin: ["http://localhost:3000", "http://localhost:3001"],
                methods: "GET, POST, PATCH, DELETE, PUT",
                allowedHeaders: "Content-Type, Authorization",
                credentials: true,
            }),
        );
        this.app.set("trust proxy", 1);
        this.app.use(
            cookieSession({
                name: "__session",
                keys: ["key1"],
                maxAge: 7 * 24 * 60 * 60 * 1000,
                secure: true,
                httpOnly: true,
                sameSite: "none",
            }),
        );

        this.app.use(morgan("dev"));
        this.app.use(cookieParser("someSecretIllChangeLater"));

        this.app.use(passport.initialize());
        passportConfig(passport);

        this.middlewares(appInit.middlewares);
        this.routes(appInit.controllers);
        this.app.use(errorHandler);
    }

    public listen() {
        this.app.listen(this.port, async () => {
            console.log(`App has started on port ${this.port}`);
            try {
                await Database.authenticate();
                console.log("Database Connection Established");
                await initModels(Database);
                await Database.sync({ alter: true, logging: false });
                await this.seedDb();
                await this.initializeCaches();
                console.log("Done syncing...");
            } catch (err) {
                console.log("Database connection failed", err);
            }
        });
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

    private async seedDb(alsoGyms?: boolean) {
        for (const state of SEED_STATES) {
            const found = await State.findOne({ where: state });
            if (found) continue;
            State.create(state);
        }
        // await City.destroy({ where: {} }); // sometimes needed when ??? occurs and there is a duplicate cityId
        for (const city of SEED_CITIES) {
            // check if city is seeded into db before trying to add a dupe
            const found = await City.findOne({ where: { cityName: city.cityName } });
            console.log("Found city with name: ", found?.cityName);
            if (found) continue;
            City.create(city);
        }
        for (const user of SEED_USERS) {
            const found = await Account.findOne({ where: { email: user.email } });
            if (found) continue;
            Account.create(user);
        }
        if (alsoGyms) {
            for (const cityGyms of SEED_GYMS_CANADA) {
                for (const gym of cityGyms) {
                    // todo: associate seeded gym with its city. use the city id cache!
                    Gym.create(gym);
                }
            }
        }
    }

    public async initializeCaches() {
        const cityDAO = new CityDAO();
        const batchDAO = new BatchDAO();
        const feedbackDAO = new FeedbackDAO();
        const cacheService = new CacheService(cityDAO, batchDAO, feedbackDAO);
        await cacheService.initBatchCache();
        await cacheService.initCityIdCache();
    }
}

export default App;
