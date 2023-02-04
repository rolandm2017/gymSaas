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
Object.defineProperty(exports, "__esModule", { value: true });
const URLMaker_1 = require("../util/URLMaker");
class EmailService {
    constructor(emailSender, emailSendingMode) {
        this.emailSenderReached = (args) => { };
        this.emailSender = emailSender;
        this.testingMode = emailSendingMode === "testing"; // safeguard to prevent accidentally setting to testing mode
    }
    sendVerificationEmail(account, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            let message;
            if (account.verificationToken === undefined || account.verificationToken === "")
                throw new Error("Verification token missing");
            // the account id and verification token combination makes a unique url for the user to visit to verify their account.
            // hence the backend needs a url that handles verifying the account, that redirects to a "account successfully verified" endpoint.
            if (accountId) {
                // send the proper user facing sequence
                // const verifyUrl = getBackendEndpoint() + `/auth/${accountId}/account/verify-email?token=${account.verificationToken}`;
                const backendEndpoint = (0, URLMaker_1.getBackendEndpoint)();
                console.log(backendEndpoint, "25rm");
                const verifyUrl = backendEndpoint + "/auth/verify-email/" + account.verificationToken;
                message = `Hi, your verification code is 9876543`;
                // message = `<p>Please click the below link to verify your email address:</p>
                //    <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
            }
            else {
                // send the code so user can hit the endpoint using Postman
                message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                       <p><code>${account.verificationToken}</code></p>`;
            }
            const args = {
                to: account.email,
                subject: "Sign-up Verification - Verify Email",
                html: `<h4>Verify Email</h4>
                   <p>Thanks for registering!</p>
                   ${message}`,
            };
            if (this.testingMode) {
                this.emailSenderReached(args);
                return;
            }
            yield this.emailSender(args);
        });
    }
    sendAlreadyRegisteredEmail(email, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            let message;
            if (accountId) {
                const url = (0, URLMaker_1.getFrontendURL)() + `/account/forgot-password`;
                message = `<p>If you don't know your password please visit the <a href="${url}">forgot password</a> page.</p>`;
            }
            else {
                //  backend only setup
                message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
            }
            const args = {
                to: email,
                subject: "Sign-up Verification API - Email Already Registered",
                html: `<h4>Email Already Registered</h4>
                   <p>Your email <strong>${email}</strong> is already registered.</p>
                   ${message}`,
            };
            if (this.testingMode) {
                this.emailSenderReached(args);
                return;
            }
            yield this.emailSender(args);
        });
    }
    sendPasswordResetEmail(account, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            let message;
            if (account.resetToken === undefined || account.resetToken.token === undefined || account.resetToken.token === "") {
                throw new Error("Reset token missing");
            }
            if (accountId) {
                // send them to the frontend url with the reset token in the url.
                // the frontend will send the reset token to the backend with the 'reset pw to new value' request to validate the change.
                const resetUrl = (0, URLMaker_1.getFrontendURL)() + `/account/reset-password?token=${account.resetToken.token}&accountId=${accountId}`;
                message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>`;
            }
            else {
                // backend only version
                message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                       <p><code>${account.resetToken.token}</code></p>`;
            }
            const args = {
                to: account.email,
                subject: "Sign-up Verification API - Reset Password",
                html: `<h4>Reset Password Email</h4>
                   ${message}`,
            };
            if (this.testingMode) {
                this.emailSenderReached(args);
                return;
            }
            yield this.emailSender(args);
        });
    }
}
exports.default = EmailService;
