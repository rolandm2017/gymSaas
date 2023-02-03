"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySMTPConnection = void 0;
const emailConfig_1 = __importDefault(require("../config/emailConfig"));
const nodemailer_1 = __importDefault(require("nodemailer"));
function sendEmail({ to, subject, html, from = emailConfig_1.default.emailFrom }, resolve) {
    return __awaiter(this, void 0, void 0, function* () {
        const transporter = nodemailer_1.default.createTransport({
            host: emailConfig_1.default.emailHost,
            port: emailConfig_1.default.emailPort,
            auth: { user: emailConfig_1.default.emailUser, pass: emailConfig_1.default.emailPassword },
        });
        console.log("Sending email to", to);
        const emailIsEnabled = process.env.EMAIL_SENDING_MODE === "development" || process.env.EMAIL_SENDING_MODE === "production";
        console.warn("Email might be enabled:", emailIsEnabled);
        if (emailIsEnabled) {
            yield transporter.sendMail({ from, to, subject, html }, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log("Email sent: ", info);
                }
                if (resolve) {
                    resolve(true);
                }
            });
        }
    });
}
function verifySMTPConnection() {
    const transporter = nodemailer_1.default.createTransport({
        host: emailConfig_1.default.emailHost,
        port: emailConfig_1.default.emailPort,
        secure: true,
        auth: { user: emailConfig_1.default.emailUser, pass: emailConfig_1.default.emailPassword },
    });
    return new Promise((resolve, reject) => {
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
                resolve(false);
            }
            else {
                console.log("Server is ready to take our messages");
                resolve(true);
            }
        });
    });
}
exports.verifySMTPConnection = verifySMTPConnection;
exports.default = sendEmail;
