"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFrontendURL = exports.getBackendEndpoint = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./.env" });
function getBackendEndpoint(path) {
    if (process.env.SERVER_ENVIRONMENT === "development") {
        const pathBase = "http://localhost:" + process.env.PORT;
        if (path) {
            return pathBase + path;
        }
        else {
            return pathBase;
        }
    }
    else {
        const pathBase = "https://www.apartmentsneargyms.com/api";
        if (path) {
            return pathBase + path;
        }
        else {
            return pathBase;
        }
    }
}
exports.getBackendEndpoint = getBackendEndpoint;
function getFrontendURL(path) {
    if (process.env.SERVER_ENVIRONMENT === "development") {
        const pathBase = "http://localhost:" + process.env.FRONTEND_PORT;
        if (path) {
            return pathBase + path;
        }
        else {
            return pathBase;
        }
    }
    else {
        const pathBase = "https://www.apartmentsneargyms.com";
        if (path) {
            return pathBase + path;
        }
        else {
            return pathBase;
        }
    }
}
exports.getFrontendURL = getFrontendURL;
