import express, { Application } from "express";
import passport from "passport";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
// import cookieSession from "cookie-session";
//
import initModels from "./database/models/init-models";
import Database from "./database/Database";
import errorHandler from "./middleware/error.middleware";

import { City } from "./database/models/City";
import { State } from "./database/models/State";

import { SEED_CITIES } from "./seed/seedCities";
import { SEED_STATES } from "./seed/seedStates";
import CacheService from "./service/cache.service";
import CityDAO from "./database/dao/city.dao";
import BatchDAO from "./database/dao/batch.dao";
import { SEED_GYMS_CANADA } from "./seed/gyms";
import { SEED_HOUSING } from "./seed/seedHousing";
import { Gym } from "./database/models/Gym";
import passportConfig from "./config/passportConfig";
import FeedbackDAO from "./database/dao/feedback.dao";
import { Housing } from "./database/models/Housing";
import TaskDAO from "./database/dao/task.dao";
import GymDAO from "./database/dao/gym.dao";
import HousingDAO from "./database/dao/housing.dao";
import StateDAO from "./database/dao/state.dao";

class App {
    public app: Application;

    public port: number;

    constructor(appInit: { port: number; middlewares: any; controllers: any }) {
        this.app = express();
        this.port = appInit.port;
        this.app.use(
            cors({
                origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
                methods: "GET, POST, PATCH, DELETE, PUT",
                allowedHeaders: "Content-Type, Authorization",
                credentials: true,
            }),
        );
        // this.app.use(
        //     session({
        //         secret: "secret",
        //         resave: false,
        //         saveUninitialized: true,
        //     }),
        // );

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
                console.log("syncing");
                await Database.sync({ alter: true, logging: false });
                console.log("seeding db");
                await this.seedDb(false, false);
                console.log("initializing caches");
                await this.initializeCaches();
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

    private async seedDb(alsoGyms?: boolean, alsoAps?: boolean) {
        for (const state of SEED_STATES) {
            const found = await State.findOne({ where: state });
            if (found) continue;
            State.create(state);
        }
        // await City.destroy({ where: {} }); // sometimes needed when ??? occurs and there is a duplicate cityId
        for (const city of SEED_CITIES) {
            // check if city is seeded into db before trying to add a dupe
            const found = await City.findOne({ where: { cityName: city.cityName } });
            console.log("Found city with name: ", found?.cityName, city.cityName);
            if (found) continue;
            City.create(city);
        }
        // for (const user of SEED_USERS) {
        //     const found = await Account.findOne({ where: { email: user.email } });
        //     if (found) continue;
        //     Account.create(user);
        // }
        if (alsoGyms) {
            const gymDAO = new GymDAO();
            for (const cityGyms of SEED_GYMS_CANADA) {
                for (const gym of cityGyms) {
                    // todo: associate seeded gym with its city. use the city id cache!
                    const found = await gymDAO.getGymByGymId(gym.gymId);
                    if (found) continue;
                    Gym.create(gym);
                }
            }
        }
        if (alsoAps) {
            // put the batch in
            console.log("HERE 130rm");
            const batchDAO = new BatchDAO();
            const highest = await batchDAO.getHighestBatchNum();
            if (highest === 1) {
                //
            } else {
                new BatchDAO().addBatchNum(1);
            }
            // add the tasks
            const stateDAO = new StateDAO();
            const cityDAO = new CityDAO();
            const housingDAO = new HousingDAO(stateDAO, cityDAO);
            console.log("HERE 134rm");
            let count = 0;
            for (const city of SEED_HOUSING) {
                for (const ap of city) {
                    if (ap.housingId) {
                        const found = await housingDAO.getHousingByHousingId(ap.housingId);
                        if (found) continue;
                        delete ap.taskId;
                        count++;
                        console.log(`seeding apartment #${count}...`);
                        housingDAO.createHousing(ap);
                    }
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
