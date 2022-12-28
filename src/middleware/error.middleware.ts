import express, { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { handleErrorResponse } from "../util/handleErrorResponse";

// fixme: err definitely isnt 'any' but idk how to discover the types
function errorHandler(err: any, request: Request, response: Response, next: NextFunction) {
    console.log(err, "5rm");
    switch (true) {
        case typeof err === "string":
            // custom application error
            const is404 = err.toLowerCase().endsWith("not found");
            const statusCode = is404 ? 404 : 400;
            return response.status(statusCode).json({ error: err });
        case err.name === "Error":
            return handleErrorResponse(response, err);
        case err.name === "ValidationError":
            return handleErrorResponse(response, err);
        case err.name === "UnauthorizedError":
            // jwt authentication error
            console.log("UnauthorizedError");
            return response.status(401).json({ error: "Unauthorized" });
        default:
            return response.status(500).json({ error: err.message });
    }
}
export default errorHandler;
