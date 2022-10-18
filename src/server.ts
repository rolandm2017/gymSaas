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

const port = parseInt(process.env.PORT!, 10);
console.log("hello world!", port);

const app = new App({
    port: port || 8000,

    controllers: [new AuthController(), new GooglePlacesController(), new ApartmentsController(), new HealthCheckController()],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});
app.listen();
