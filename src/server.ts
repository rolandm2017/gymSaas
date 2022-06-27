import cookieParser from "cookie-parser";
// import moduleAlias from "module-alias";
import bodyParser from "body-parser";
import App from "./app";
import GooglePlacesController from "./controllers/googlePlaces.controller";
import HousingController from "./controllers/apartments.controller";
console.log("hello world!");
const app = new App({
    port: parseInt(process.env.PORT!, 10) || 8000,
    controllers: [new GooglePlacesController(), new HousingController()],
    middlewares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), cookieParser()],
});
console.log("in the container?", app.port);
app.listen();
