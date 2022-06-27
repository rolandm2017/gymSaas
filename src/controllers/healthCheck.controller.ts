import express, { Request, Response } from "express";

class HealthCheckController {
    public path = "/health";
    public router = express.Router();

    constructor() {
        this.router.get("/", this.checkStatus);
    }

    async checkStatus(request: Request, response: Response) {
        console.log("In check status...");
        return response.status(200).send("Up and running");
    }
}

export default HealthCheckController;
