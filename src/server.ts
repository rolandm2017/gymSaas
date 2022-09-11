import cookieParser from "cookie-parser";
// import moduleAlias from "module-alias";
import bodyParser from "body-parser";
import App from "./app";
import GooglePlacesController from "./controllers/googlePlaces.controller";
import ApartmentsController from "./controllers/apartments.controller";
import HealthCheckController from "./controllers/healthCheck.controller";

const port = parseInt(process.env.PORT!, 10);
console.log("hello world!", port);

const app = new App({
    port: port || 8000,
    controllers: [new GooglePlacesController(), new ApartmentsController(), new HealthCheckController()],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});
console.log("in the container?", app.port);
app.listen();
