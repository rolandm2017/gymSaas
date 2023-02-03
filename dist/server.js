"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
//
const gyms_controller_1 = __importDefault(require("./controllers/gyms.controller"));
const housing_controller_1 = __importDefault(require("./controllers/housing.controller"));
const auth_controller_1 = __importDefault(require("./controllers/auth.controller"));
const auth_service_1 = __importDefault(require("./service/auth.service"));
const email_service_1 = __importDefault(require("./service/email.service"));
const account_dao_1 = __importDefault(require("./database/dao/account.dao"));
const resetToken_dao_1 = __importDefault(require("./database/dao/resetToken.dao"));
const accountUtil_1 = __importDefault(require("./util/accountUtil"));
const taskQueue_controller_1 = __importDefault(require("./controllers/taskQueue.controller"));
const taskQueue_service_1 = __importDefault(require("./service/taskQueue.service"));
const task_dao_1 = __importDefault(require("./database/dao/task.dao"));
const city_dao_1 = __importDefault(require("./database/dao/city.dao"));
const housing_dao_1 = __importDefault(require("./database/dao/housing.dao"));
const state_dao_1 = __importDefault(require("./database/dao/state.dao"));
const housing_service_1 = __importDefault(require("./service/housing.service"));
const scraper_service_1 = __importDefault(require("./service/scraper.service"));
const cache_service_1 = __importDefault(require("./service/cache.service"));
const batch_dao_1 = __importDefault(require("./database/dao/batch.dao"));
const admin_controller_1 = __importDefault(require("./controllers/admin.controller"));
const admin_service_1 = __importDefault(require("./service/admin.service"));
//
const app_1 = __importDefault(require("./app"));
const gym_service_1 = __importDefault(require("./service/gym.service"));
const gym_dao_1 = __importDefault(require("./database/dao/gym.dao"));
const googlePlaces_1 = __importDefault(require("./api/googlePlaces"));
const connectionFactory_1 = __importDefault(require("./scrapers/connectionFactory"));
const locationDiscovery_service_1 = __importDefault(require("./service/locationDiscovery.service"));
const sendEmail_1 = __importDefault(require("./util/sendEmail"));
const profile_service_1 = __importDefault(require("./service/profile.service"));
const profile_dao_1 = __importDefault(require("./database/dao/profile.dao"));
const profile_controller_1 = __importDefault(require("./controllers/profile.controller"));
const feedback_dao_1 = __importDefault(require("./database/dao/feedback.dao"));
const feedback_controller_1 = __importDefault(require("./controllers/feedback.controller"));
const wish_controller_1 = __importDefault(require("./controllers/wish.controller"));
const feedback_service_1 = __importDefault(require("./service/feedback.service"));
const wish_service_1 = __importDefault(require("./service/wish.service"));
const wish_dao_1 = __importDefault(require("./database/dao/wish.dao"));
const refreshToken_dao_1 = __importDefault(require("./database/dao/refreshToken.dao"));
const emailConfig_1 = require("./config/emailConfig");
const port = parseInt(process.env.PORT, 10);
// dao
const batchDAO = new batch_dao_1.default();
const cityDAO = new city_dao_1.default();
const stateDAO = new state_dao_1.default();
const housingDAO = new housing_dao_1.default(stateDAO, cityDAO);
const taskDAO = new task_dao_1.default();
const acctDAO = new account_dao_1.default();
const resetTokenDAO = new resetToken_dao_1.default(acctDAO);
const gymDAO = new gym_dao_1.default();
const profileDAO = new profile_dao_1.default();
const feedbackDAO = new feedback_dao_1.default();
const wishDAO = new wish_dao_1.default();
const refreshTokenDAO = new refreshToken_dao_1.default();
// misc
const accountUtil = new accountUtil_1.default(refreshTokenDAO);
const googlePlacesAPI = new googlePlaces_1.default();
const locationDiscoveryService = new locationDiscovery_service_1.default();
const scraperFactory = new connectionFactory_1.default(taskDAO);
// services
// is there a better place to initialize these?
const adminService = new admin_service_1.default(acctDAO);
const emailService = new email_service_1.default(sendEmail_1.default, emailConfig_1.emailSendingMode);
const scraperService = new scraper_service_1.default(scraperFactory, locationDiscoveryService);
const authService = new auth_service_1.default(emailService, accountUtil, acctDAO, profileDAO, resetTokenDAO, refreshTokenDAO);
const cacheService = new cache_service_1.default(cityDAO, batchDAO, feedbackDAO);
const housingService = new housing_service_1.default(housingDAO, gymDAO, acctDAO, profileDAO, cityDAO, cacheService, scraperService);
const taskQueueService = new taskQueue_service_1.default(housingDAO, taskDAO, cityDAO, batchDAO, cacheService);
const gymService = new gym_service_1.default(gymDAO, cacheService, googlePlacesAPI);
const profileService = new profile_service_1.default(profileDAO, acctDAO, housingDAO, gymDAO);
const feedbackService = new feedback_service_1.default(cacheService, feedbackDAO, profileDAO);
const wishService = new wish_service_1.default(wishDAO, profileDAO);
const app = new app_1.default({
    port: port || 8000,
    controllers: [
        new auth_controller_1.default(authService),
        new gyms_controller_1.default(gymService),
        new housing_controller_1.default(housingService, scraperService),
        new taskQueue_controller_1.default(taskQueueService, scraperService, cacheService),
        new admin_controller_1.default(adminService, taskQueueService, housingService),
        new profile_controller_1.default(profileService),
        new feedback_controller_1.default(feedbackService),
        new wish_controller_1.default(wishService),
    ],
    middlewares: [body_parser_1.default.json(), body_parser_1.default.urlencoded({ extended: true }), (0, cookie_parser_1.default)()],
});
app.listen();
