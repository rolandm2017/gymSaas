import express, { ErrorRequestHandler, NextFunction, Request, Response } from "express";

// fixme: err definitely isnt 'any' but idk how to discover the types
function errorHandler(err: any, request: Request, response: Response, next: NextFunction) {
    switch (true) {
        case typeof err === "string":
            // custom application error
            const is404 = err.toLowerCase().endsWith("not found");
            const statusCode = is404 ? 404 : 400;
            return response.status(statusCode).json({ message: err });
        case err.name === "Error":
            return response.status(400).json({ message: err.message }); // "why not errorResponse here too?"
        // the answer is that I like seeing 'message' as a clue where the err is from
        case err.name === "ValidationError":
            return response.status(400).json({ message: err.message });
        case err.name === "UnauthorizedError":
            // jwt authentication error
            console.log("UnauthorizedError");
            return response.status(401).json({ message: "Unauthorized" });
        default:
            return response.status(500).json({ message: err.message });
    }
}
export default errorHandler;
