import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import App from "./app";
import GooglePlacesController from "./controllers/googlePlaces.controller";
import ApartmentsController from "./controllers/apartments.controller";
import HealthCheckController from "./controllers/healthCheck.controller";
import AuthController from "./controllers/auth.controller";
import AuthService from "./service/auth.service";
import EmailService from "./service/email.service";

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
console.log("in the container?", app.port);
app.listen();
