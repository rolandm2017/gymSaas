import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
//
import GymsController from "./controllers/gyms.controller";
import HousingController from "./controllers/housing.controller";
import AuthController from "./controllers/auth.controller";
import AuthService from "./service/auth.service";
import EmailService from "./service/email.service";
import AccountDAO from "./database/dao/account.dao";
import ResetTokenDAO from "./database/dao/resetToken.dao";
import AccountUtil from "./util/accountUtil";
import TaskQueueController from "./controllers/taskQueue.controller";
import TaskQueueService from "./service/taskQueue.service";
import TaskDAO from "./database/dao/task.dao";
import CityDAO from "./database/dao/city.dao";
import HousingDAO from "./database/dao/housing.dao";
import StateDAO from "./database/dao/state.dao";
import HousingService from "./service/housing.service";
import ScraperService from "./service/scraper.service";
import CacheService from "./service/cache.service";
import BatchDAO from "./database/dao/batch.dao";
import AdminController from "./controllers/admin.controller";
import AdminService from "./service/admin.service";
//
import App from "./app";
import GymService from "./service/gym.service";
import GymDAO from "./database/dao/gym.dao";
import GooglePlacesAPI from "./api/googlePlaces";
import ScraperFactory from "./scrapers/connectionFactory";
import LocationDiscoveryService from "./service/locationDiscovery.service";
import sendEmail from "./util/sendEmail";
import ProfileService from "./service/profile.service";
import ProfileDAO from "./database/dao/profile.dao";
import ProfileController from "./controllers/profile.controller";

const port = parseInt(process.env.PORT!, 10);

// misc
const accountUtil: AccountUtil = new AccountUtil();
const googlePlacesAPI: GooglePlacesAPI = new GooglePlacesAPI();
const locationDiscoveryService: LocationDiscoveryService = new LocationDiscoveryService();

// dao
const batchDAO = new BatchDAO();
const cityDAO = new CityDAO();
const stateDAO = new StateDAO();
const housingDAO = new HousingDAO(stateDAO, cityDAO);
const taskDAO = new TaskDAO();
const acctDAO: AccountDAO = new AccountDAO();
const resetTokenDAO: ResetTokenDAO = new ResetTokenDAO(acctDAO);
const gymDAO = new GymDAO();
const profileDAO = new ProfileDAO();

const scraperFactory: ScraperFactory = new ScraperFactory(taskDAO);
// services
// is there a better place to initialize these?
const adminService = new AdminService(acctDAO);
const emailService: EmailService = new EmailService(sendEmail, "development");
const scraperService = new ScraperService(scraperFactory, locationDiscoveryService);
const authService: AuthService = new AuthService(emailService, accountUtil, acctDAO, resetTokenDAO);
const cacheService = new CacheService(cityDAO, batchDAO);
const housingService = new HousingService(housingDAO, gymDAO, cacheService);
const taskQueueService = new TaskQueueService(housingDAO, taskDAO, cacheService);
const gymService = new GymService(gymDAO, cacheService, googlePlacesAPI);
const profileService = new ProfileService(profileDAO);

const app = new App({
    port: port || 8000,

    controllers: [
        new AuthController(authService),
        new GymsController(gymService),
        new HousingController(housingService, scraperService),
        new TaskQueueController(taskQueueService, scraperService, cacheService),
        new AdminController(adminService, taskQueueService, housingService),
        new ProfileController(profileService),
    ],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});

app.listen();
