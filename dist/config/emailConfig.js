"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSendingMode = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./.env" });
const failure = "failedToLoad";
const emailFrom = process.env.PRIVATE_EMAIL ? process.env.PRIVATE_EMAIL : failure;
const emailHost = process.env.PRIVATE_EMAIL_HOST ? process.env.PRIVATE_EMAIL_HOST : failure;
const emailPort = process.env.PRIVATE_EMAIL_PORT ? parseInt(process.env.PRIVATE_EMAIL_PORT, 10) : 465;
const emailUser = process.env.PRIVATE_EMAIL_USER ? process.env.PRIVATE_EMAIL_USER : failure;
const emailPassword = process.env.PRIVATE_EMAIL_PASSWORD ? process.env.PRIVATE_EMAIL_PASSWORD : failure;
function getEmailMode() {
    console.log("Email Mode: " + process.env.EMAIL_SENDING_MODE);
    if (process.env.EMAIL_SENDING_MODE === "testing") {
        return "testing";
    }
    else if (process.env.EMAIL_SENDING_MODE === "development") {
        return "development";
    }
    else if (process.env.EMAIL_SENDING_MODE === "production") {
        return "production";
    }
    else {
        throw Error("Invalid configuration:" + process.env.EMAIL_SENDING_MODE);
    }
}
exports.emailSendingMode = getEmailMode();
if (emailFrom == failure || emailHost == failure || emailUser == failure || emailPassword == failure) {
    throw Error("Failed to load private email details");
}
exports.default = { emailFrom, emailHost, emailPort, emailUser, emailPassword };
