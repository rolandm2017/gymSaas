import dotenv from "dotenv";
import e from "express";

dotenv.config({ path: "./.env" });

const failure = "failedToLoad";

const emailFrom = process.env.PRIVATE_EMAIL ? process.env.PRIVATE_EMAIL : failure;
const emailHost = process.env.PRIVATE_EMAIL_HOST ? process.env.PRIVATE_EMAIL_HOST : failure;
const emailPort = process.env.PRIVATE_EMAIL_PORT ? parseInt(process.env.PRIVATE_EMAIL_PORT, 10) : 465;
const emailUser = process.env.PRIVATE_EMAIL_USER ? process.env.PRIVATE_EMAIL_USER : failure;
const emailPassword = process.env.PRIVATE_EMAIL_PASSWORD ? process.env.PRIVATE_EMAIL_PASSWORD : failure;

function getEmailMode() {
    if (process.env.EMAIL_SENDING_MODE === "testing") {
        return "testing";
    } else if (process.env.EMAIL_SENDING_MODE === "development") {
        return "development";
    } else if (process.env.EMAIL_SENDING_MODE === "production") {
        return "production";
    } else {
        throw Error("Invalid configuration:", process.env.EMAIL_SENDING_MODE);
    }
}

export const emailSendingMode = getEmailMode();

if (emailFrom == failure || emailHost == failure || emailUser == failure || emailPassword == failure) {
    throw Error("Failed to load private email details");
}

export default { emailFrom, emailHost, emailPort, emailUser, emailPassword };
