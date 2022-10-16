import { IAccount } from "../interface/Account.interface";

import sendEmail from "../util/sendEmail";

class EmailService {
    public async sendVerificationEmail(account: IAccount, origin: string) {
        let message;
        if (origin) {
            const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
            message = `<p>Please click the below link to verify your email address:</p>
                       <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
        } else {
            message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                       <p><code>${account.verificationToken}</code></p>`;
        }

        await sendEmail({
            to: account.email,
            subject: "Sign-up Verification API - Verify Email",
            html: `<h4>Verify Email</h4>
                   <p>Thanks for registering!</p>
                   ${message}`,
        });
    }

    public async sendAlreadyRegisteredEmail(email, origin: string) {
        let message;
        if (origin) {
            message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
        } else {
            message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
        }

        await sendEmail({
            to: email,
            subject: "Sign-up Verification API - Email Already Registered",
            html: `<h4>Email Already Registered</h4>
                   <p>Your email <strong>${email}</strong> is already registered.</p>
                   ${message}`,
        });
    }

    public async sendPasswordResetEmail(account: IAccount, origin: string) {
        let message;
        if (account.resetToken === undefined) {
            throw new Error("Reset token missing");
        }
        if (origin) {
            const resetUrl = `${origin}/account/reset-password?token=${account.resetToken.token}`;
            message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                       <p><a href="${resetUrl}">${resetUrl}</a></p>`;
        } else {
            message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                       <p><code>${account.resetToken.token}</code></p>`;
        }

        await sendEmail({
            to: account.email,
            subject: "Sign-up Verification API - Reset Password",
            html: `<h4>Reset Password Email</h4>
                   ${message}`,
        });
    }
}

export default EmailService;
