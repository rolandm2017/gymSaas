import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export function getBackendEndpoint(path?: string) {
    if (process.env.SERVER_ENVIRONMENT === "development") {
        const pathBase = "http://localhost:8000";
        if (path) {
            return pathBase + path;
        } else {
            return pathBase;
        }
    } else {
        const pathBase = "https://www.api.apartmentsneargyms.com";
        if (path) {
            return pathBase + path;
        } else {
            return pathBase;
        }
    }
}

export function getFrontendEndpoint(path?: string) {
    if (process.env.SERVER_ENVIRONMENT === "development") {
        const pathBase = "http://localhost:3002";
        if (path) {
            return pathBase + path;
        } else {
            return pathBase;
        }
    } else {
        const pathBase = "https://www.apartmentsneargyms.com";
        if (path) {
            return pathBase + path;
        } else {
            return pathBase;
        }
    }
}
