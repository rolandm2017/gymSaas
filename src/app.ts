import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import initModels from "./database/models/init-models";
import Database from "./database/Database";
// import ErrorMiddleware from "./middleware/error.middleware";

class App {
    public app: Application;

    public port: number;

    constructor(appInit: { port: number; middlewares: any; controllers: any }) {
        this.app = express();
        this.port = appInit.port;
        this.app.use(cors());
        this.app.use(morgan("dev"));
        this.app.use(cookieParser());
        this.middlewares(appInit.middlewares);
        // this.app.use(ErrorMiddleware.handleRouteErrors); // this will catch any error thrown routes
        this.routes(appInit.controllers);
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App has started on port ${this.port}`);
            Database.authenticate()
                .then(async () => {
                    console.log("Database Connection Established");
                    await initModels(Database);
                    await Database.sync();
                })
                .catch((error: string) => {
                    console.log("Database connection failed", error);
                });
        });
    }

    private middlewares(middlewares: any) {
        console.log(middlewares, "in the middlewares, 41rm");
        middlewares.forEach((middleware: any) => {
            this.app.use(middleware);
        });
    }

    private routes(controllers: any) {
        controllers.forEach((controller: any) => {
            console.log("controller use", controller.path, controller.router, controller.test, "484848");
            this.app.use(controller.path, controller.router);
        });
    }
}

export default App;
