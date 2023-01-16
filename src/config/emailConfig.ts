const failure = "failedToLoad";

export const emailFrom = process.env.PRIVATE_EMAIL ? process.env.PRIVATE_EMAIL : failure;
export const emailHost = process.env.PRIVATE_EMAIL_HOST ? process.env.PRIVATE_EMAIL_HOST : failure;
export const emailPort = process.env.PRIVATE_EMAIL_PORT ? parseInt(process.env.PRIVATE_EMAIL_PORT, 10) : 465;
export const emailUser = process.env.PRIVATE_EMAIL_USER ? process.env.PRIVATE_EMAIL_USER : failure;
export const emailPassword = process.env.PRIVATE_EMAIL_PASSWORD ? process.env.PRIVATE_EMAIL_PASSWORD : failure;

if (emailFrom == failure || emailHost == failure || emailUser == failure || emailPassword == failure) {
    throw Error("Failed to load private email details");
}

export default { emailFrom, emailHost, emailPort, emailUser, emailPassword };
