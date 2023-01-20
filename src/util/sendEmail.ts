import config from "../config/emailConfig";
import nodemailer from "nodemailer";

export interface ISendEmail {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

async function sendEmail({ to, subject, html, from = config.emailFrom }: ISendEmail, resolve?: Function) {
    const transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        auth: { user: config.emailUser, pass: config.emailPassword },
    });
    console.log("Sending email to", to);
    const emailIsEnabled = process.env.EMAIL_SENDING_MODE === "development" || process.env.EMAIL_SENDING_MODE === "production";
    console.warn("Email might be enabled:", emailIsEnabled);
    if (emailIsEnabled) {
        await transporter.sendMail({ from, to, subject, html }, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: ", info);
            }
            if (resolve) {
                resolve(true);
            }
        });
    }
}

export function verifySMTPConnection(): Promise<boolean> {
    const transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        secure: true,
        auth: { user: config.emailUser, pass: config.emailPassword },
    });
    return new Promise((resolve, reject) => {
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
                resolve(false);
            } else {
                console.log("Server is ready to take our messages");
                resolve(true);
            }
        });
    });
}

export default sendEmail;
