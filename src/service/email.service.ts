import { IAccount } from "../interface/Account.interface";

import { getBackendEndpoint, getFrontendEndpoint } from "../util/getEndpoint";

class EmailService {
    private emailSender: Function;
    private testingMode: boolean;
    public emailSenderReached: Function = (a: any) => {};

    constructor(emailSender: Function, emailSendingMode: "testing" | "production" | "development") {
        this.emailSender = emailSender;
        this.testingMode = emailSendingMode === "testing"; // safeguard to prevent accidentally setting to testing mode
    }

    public async sendVerificationEmail(account: IAccount, accountId: string) {
        let message;
        if (account.verificationToken === undefined || account.verificationToken === "") throw new Error("Verification token missing");
        // the account id and verification token combination makes a unique url for the user to visit to verify their account.
        // hence the backend needs a url that handles verifying the account, that redirects to a "account successfully verified" endpoint.
        if (accountId) {
            // send the proper user facing sequence
            const verifyUrl = getBackendEndpoint() + `/${accountId}/account/verify-email?token=${account.verificationToken}`;
            console.log(verifyUrl, "23rm");
            message = `<p>Please click the below link to verify your email address:</p>
                       <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
        } else {
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
        await this.emailSender(args);
    }

    public async sendAlreadyRegisteredEmail(email: string, accountId: string) {
        let message;
        if (accountId) {
            const url = getBackendEndpoint() + `${accountId}/account/forgot-password`;
            message = `<p>If you don't know your password please visit the <a href="${url}">forgot password</a> page.</p>`;
        } else {
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
        await this.emailSender(args);
    }

    public async sendPasswordResetEmail(account: IAccount, accountId: string) {
        let message;
        if (account.resetToken === undefined || account.resetToken.token === undefined || account.resetToken.token === "") {
            throw new Error("Reset token missing");
        }
        if (accountId) {
            // send them to the frontend url with the reset token in the url.
            // the frontend will send the reset token to the backend with the 'reset pw to new value' request to validate the change.
            const resetUrl = getFrontendEndpoint() + `${accountId}/account/reset-password?token=${account.resetToken.token}`;
            message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>`;
        } else {
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
        await this.emailSender(args);
    }
}

export default EmailService;
