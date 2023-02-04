import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export function getBackendEndpoint(path?: string) {
    if (process.env.SERVER_ENVIRONMENT === "development") {
        const pathBase = "http://localhost:" + process.env.PORT;
        if (path) {
            return pathBase + path;
        } else {
            return pathBase;
        }
    } else {
        const pathBase = "https://www.apartmentsneargyms.com/api";
        if (path) {
            return pathBase + path;
        } else {
            return pathBase;
        }
    }
}

export function getFrontendURL(path?: string) {
    if (process.env.SERVER_ENVIRONMENT === "development") {
        const pathBase = "http://localhost:" + process.env.FRONTEND_PORT;
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
