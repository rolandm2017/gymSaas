import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import App from "./app";
import GooglePlacesController from "./controllers/googlePlaces.controller";
import ApartmentsController from "./controllers/apartments.controller";
import HealthCheckController from "./controllers/healthCheck.controller";
import AuthController from "./controllers/auth.controller";
import AuthService from "./service/auth.service";
import EmailService from "./service/email.service";
import errorHandler from "./middleware/error.middleware";
import AccountDAO from "./database/dao/account.dao";
import ResetTokenDAO from "./database/dao/resetToken.dao";
import AccountUtil from "./util/accountUtil";
import TaskQueueController from "./controllers/taskQueue.controller";
import TaskQueueService from "./service/taskQueue.service";
import TaskDAO from "./database/dao/task.dao";
import CityDAO from "./database/dao/city.dao";
// import TestController from "./controllers/test.controller";
import HousingDAO from "./database/dao/housing.dao";

const port = parseInt(process.env.PORT!, 10);

const cityDAO = new CityDAO();
const housingDAO = new HousingDAO();
const taskDAO = new TaskDAO();
const acctDAO: AccountDAO = new AccountDAO();
const resetTokenDAO: ResetTokenDAO = new ResetTokenDAO(acctDAO);

// services
// is there a better place to initialize these?
const e: EmailService = new EmailService(acctDAO);
const accountUtil: AccountUtil = new AccountUtil();
const authService: AuthService = new AuthService(e, accountUtil, acctDAO, resetTokenDAO);
const taskQueueService = new TaskQueueService(cityDAO, housingDAO, taskDAO);

const app = new App({
    port: port || 8000,

    controllers: [
        new AuthController(authService),
        new GooglePlacesController(),
        new ApartmentsController(),
        new TaskQueueController(taskQueueService),
        new HealthCheckController(),
    ],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});

app.listen();
