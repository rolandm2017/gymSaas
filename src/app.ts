import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import initModels from "./database/models/init-models";
import Database from "./database/Database";
// import ErrorMiddleware from "./middleware/error.middleware";
import errorHandler from "./middleware/error.middleware";

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
        this.app.use(errorHandler);
    }

    public listen() {
        this.app.listen(this.port, async () => {
            console.log(`App has started on port ${this.port}`);
            try {
                await Database.authenticate();
                console.log("Database Connection Established");
                await initModels(Database);
                await Database.sync();
                console.log("Done syncing...");
            } catch (err) {
                console.log("Database connection failed", err);
            }
        });
    }

    public getServer() {
        return this.app;
    }

    private middlewares(middlewares: any) {
        middlewares.forEach((middleware: any) => {
            // console.log("adding middleware...");
            this.app.use(middleware);
        });
    }

    private routes(controllers: any) {
        controllers.forEach((controller: any) => {
            // console.log(controller.path, "... is running");
            this.app.use(controller.path, controller.router);
        });
    }
}

export default App;
