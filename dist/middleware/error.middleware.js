"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleErrorResponse_1 = require("../util/handleErrorResponse");
// fixme: err definitely isnt 'any' but idk how to discover the types
function errorHandler(err, request, response, next) {
    console.log("error:", err);
    switch (true) {
        case typeof err === "string":
            // custom application error
            const is404 = err.toLowerCase().endsWith("not found");
            const statusCode = is404 ? 404 : 400;
            return response.status(statusCode).json({ error: err });
        case err.name === "Error":
            return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
        case err.name === "ValidationError":
            return (0, handleErrorResponse_1.handleErrorResponse)(response, err);
        case err.name === "UnauthorizedError":
            // jwt authentication error
            console.log("UnauthorizedError");
            return response.status(401).json({ error: "Unauthorized" });
        default:
            return response.status(500).json({ error: err.message });
    }
}
exports.default = errorHandler;
