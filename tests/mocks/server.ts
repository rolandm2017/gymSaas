import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import App from "../../src/app";
import GooglePlacesController from "../../src/controllers/googlePlaces.controller";
import ApartmentsController from "../../src/controllers/apartments.controller";
import HealthCheckController from "../../src/controllers/healthCheck.controller";
import AuthController from "../../src/controllers/auth.controller";
import AuthService from "../../src/service/auth.service";
import EmailService from "../../src/service/email.service";

const port = parseInt(process.env.PORT!, 10);
console.log("hello world!", port);

// init services
const e = new EmailService();
const a = new AuthService(e);

const app = new App({
    port: port || 8000,

    controllers: [new AuthController(a), new GooglePlacesController(), new ApartmentsController(), new HealthCheckController()],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});

const server = app.getServer();

export default server;
