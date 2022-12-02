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
import ApartmentService from "./service/apartment.service";
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

const port = parseInt(process.env.PORT!, 10);

// misc
const accountUtil: AccountUtil = new AccountUtil();
const googlePlacesAPI: GooglePlacesAPI = new GooglePlacesAPI();

// dao
const batchDAO = new BatchDAO();
const cityDAO = new CityDAO();
const stateDAO = new StateDAO();
const housingDAO = new HousingDAO(stateDAO, cityDAO);
const taskDAO = new TaskDAO();
const acctDAO: AccountDAO = new AccountDAO();
const resetTokenDAO: ResetTokenDAO = new ResetTokenDAO(acctDAO);
const gymDAO = new GymDAO();

// services
// is there a better place to initialize these?
const adminService = new AdminService(acctDAO);
const e: EmailService = new EmailService(acctDAO);
const apartmentService = new ApartmentService(housingDAO);
const scraperService = new ScraperService();
const authService: AuthService = new AuthService(e, accountUtil, acctDAO, resetTokenDAO);
const cacheService = new CacheService(cityDAO, batchDAO);
const taskQueueService = new TaskQueueService(cityDAO, housingDAO, batchDAO, taskDAO, cacheService);
const gymService = new GymService(gymDAO, cacheService, googlePlacesAPI);

const app = new App({
    port: port || 8000,

    controllers: [
        new AuthController(authService),
        new GymsController(gymService),
        new HousingController(apartmentService, scraperService),
        new TaskQueueController(taskQueueService, scraperService, cacheService),
        new AdminController(adminService, taskQueueService, apartmentService),
    ],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});

app.listen();
