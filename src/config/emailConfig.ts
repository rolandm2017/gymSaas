import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const failure = "failedToLoad";

const emailFrom = process.env.PRIVATE_EMAIL ? process.env.PRIVATE_EMAIL : failure;
const emailHost = process.env.PRIVATE_EMAIL_HOST ? process.env.PRIVATE_EMAIL_HOST : failure;
const emailPort = process.env.PRIVATE_EMAIL_PORT ? parseInt(process.env.PRIVATE_EMAIL_PORT, 10) : 465;
const emailUser = process.env.PRIVATE_EMAIL_USER ? process.env.PRIVATE_EMAIL_USER : failure;
const emailPassword = process.env.PRIVATE_EMAIL_PASSWORD ? process.env.PRIVATE_EMAIL_PASSWORD : failure;

if (emailFrom == failure || emailHost == failure || emailUser == failure || emailPassword == failure) {
    throw Error("Failed to load private email details");
}

export default { emailFrom, emailHost, emailPort, emailUser, emailPassword };
