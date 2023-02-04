"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
// import cookieSession from "cookie-session";
//
const init_models_1 = __importDefault(require("./database/models/init-models"));
const Database_1 = __importDefault(require("./database/Database"));
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
const City_1 = require("./database/models/City");
const State_1 = require("./database/models/State");
const seedCities_1 = require("./seed/seedCities");
const seedStates_1 = require("./seed/seedStates");
const cache_service_1 = __importDefault(require("./service/cache.service"));
const city_dao_1 = __importDefault(require("./database/dao/city.dao"));
const batch_dao_1 = __importDefault(require("./database/dao/batch.dao"));
const gyms_1 = require("./seed/gyms");
const Gym_1 = require("./database/models/Gym");
const passportConfig_1 = __importDefault(require("./config/passportConfig"));
const feedback_dao_1 = __importDefault(require("./database/dao/feedback.dao"));
const gym_dao_1 = __importDefault(require("./database/dao/gym.dao"));
const housing_dao_1 = __importDefault(require("./database/dao/housing.dao"));
const state_dao_1 = __importDefault(require("./database/dao/state.dao"));
const seedUsers_1 = require("./seed/seedUsers");
const account_dao_1 = __importDefault(require("./database/dao/account.dao"));
// import { SEED_TASKS } from "./seed/seedTasks";
class App {
    constructor(appInit) {
        this.app = (0, express_1.default)();
        this.port = appInit.port;
        this.app.use((0, cors_1.default)({
            origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://www.apartmentsneargyms.com"],
            methods: "GET, POST, PATCH, DELETE, PUT",
            allowedHeaders: "Content-Type, Authorization",
            credentials: true,
        }));
        this.app.use(body_parser_1.default.json({ limit: "50mb" }));
        this.app.use((0, morgan_1.default)("dev"));
        this.app.use((0, cookie_parser_1.default)("someSecretIllChangeLater"));
        this.app.use(passport_1.default.initialize());
        (0, passportConfig_1.default)(passport_1.default);
        this.middlewares(appInit.middlewares);
        this.routes(appInit.controllers);
        this.app.use(error_middleware_1.default);
    }
    listen() {
        this.app.listen(this.port, () => __awaiter(this, void 0, void 0, function* () {
            console.log(`App has started on port ${this.port}`);
            try {
                yield Database_1.default.authenticate();
                console.log("Database Connection Established");
                yield (0, init_models_1.default)(Database_1.default);
                console.log("syncing");
                yield Database_1.default.sync({ alter: true, logging: false });
                console.log("seeding db");
                yield this.seedDb(false, false, false);
                console.log("initializing caches");
                yield this.initializeCaches();
            }
            catch (err) {
                console.log("Database connection failed", err);
            }
        }));
    }
    getServer() {
        return this.app;
    }
    middlewares(middlewares) {
        middlewares.forEach((middleware) => {
            // console.log("adding middleware...");
            this.app.use(middleware);
        });
    }
    routes(controllers) {
        controllers.forEach((controller) => {
            // console.log(controller.path, "... is running");
            this.app.use(controller.path, controller.router);
        });
    }
    seedDb(alsoGyms, alsoAps, alsoTasks) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const state of seedStates_1.SEED_STATES) {
                const found = yield State_1.State.findOne({ where: state });
                if (found)
                    continue;
                State_1.State.create(state);
            }
            // await City.destroy({ where: {} }); // sometimes needed when ??? occurs and there is a duplicate cityId
            for (const city of seedCities_1.SEED_CITIES) {
                // check if city is seeded into db before trying to add a dupe
                const found = yield City_1.City.findOne({ where: { cityName: city.cityName } });
                console.log("Found city with name: ", found === null || found === void 0 ? void 0 : found.cityName, city.cityName);
                if (found)
                    continue;
                City_1.City.create(city);
            }
            const accountDAO = new account_dao_1.default();
            for (const user of seedUsers_1.SEED_USERS) {
                const found = yield accountDAO.getAccountByEmail(user.email);
                if (found) {
                    console.log(user.email, "is in the db");
                    continue;
                }
                console.log("Seeding admin");
                yield accountDAO.createAccount(user);
            }
            if (alsoGyms) {
                const gymDAO = new gym_dao_1.default();
                for (const cityGyms of gyms_1.SEED_GYMS_CANADA) {
                    for (const gym of cityGyms) {
                        // todo: associate seeded gym with its city. use the city id cache!
                        const found = yield gymDAO.getGymByGymId(gym.gymId);
                        if (found)
                            continue;
                        Gym_1.Gym.create(gym);
                    }
                }
            }
            // if (alsoTasks) {
            //     // put the batch in
            //     const batchDAO = new BatchDAO();
            //     const highest = await batchDAO.getHighestBatchNum();
            //     if (highest === 1) {
            //         //
            //     } else {
            //         new BatchDAO().addBatchNum(1);
            //     }
            //     const taskDAO = new TaskDAO();
            //     let count = 0;
            //     for (const task of SEED_TASKS) {
            //         if (task.taskId) {
            //             const found = await taskDAO.getTaskById(task.taskId);
            //             if (found) continue;
            //             count++;
            //             taskDAO.createTask(task);
            //         }
            //     }
            //     console.log("seeded " + count + " tasks");
            // }
        });
    }
    initializeCaches() {
        return __awaiter(this, void 0, void 0, function* () {
            const cityDAO = new city_dao_1.default();
            const batchDAO = new batch_dao_1.default();
            const feedbackDAO = new feedback_dao_1.default();
            const cacheService = new cache_service_1.default(cityDAO, batchDAO, feedbackDAO);
            yield cacheService.initBatchCache();
            yield cacheService.initCityIdCache();
            const stateDAO = new state_dao_1.default();
            const housingDAO = new housing_dao_1.default(stateDAO, cityDAO);
            const highest = yield housingDAO.getHighestHousingId();
            cacheService.initHousingId(highest + 1);
        });
    }
}
exports.default = App;
