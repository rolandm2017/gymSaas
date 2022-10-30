import express, { NextFunction, Request, response, Response } from "express";

import {
    authenticateUserSchema,
    createAccountSchema,
    forgotPasswordSchema,
    registerUserSchema,
    updatePasswordSchema,
    resetPasswordSchema,
    revokeTokenSchema,
    updateRoleSchema,
    validateResetTokenSchema,
    verifyEmailSchema,
} from "../validationSchemas/schemas";
import authorize from "../middleware/authorize.middleware";
import { RequestWithUser } from "../interface/RequestWithUser.interface";
import { Role } from "../enum/role.enum";
import AuthService from "../service/auth.service";
import errorHandler from "../middleware/error.middleware";
import { IAccount } from "../interface/Account.interface";
import { ISmallError } from "../interface/SmallError.interface";
import { IBasicDetails } from "../interface/BasicDetails.interface";

class AuthController {
    public path = "/auth";
    public router = express.Router();
    private authService: AuthService;

    constructor(a: AuthService) {
        this.authService = a;
        this.router.get("/health", this.healthCheck);
        // login & register
        this.router.post("/authenticate", authenticateUserSchema, this.authenticate);
        this.router.post("/register", registerUserSchema, this.register);
        // tokens
        this.router.post("/refresh_token", this.refreshToken);
        // note: /revoke_token === /log_out
        this.router.post("/revoke_token", authorize(), revokeTokenSchema, this.revokeToken);
        // verify email
        this.router.post("/verify_email", verifyEmailSchema, this.verifyEmail);
        // update pw
        this.router.post("/update_password", authorize(), updatePasswordSchema, this.updatePassword);
        // pw reset
        this.router.post("/forgot_password", forgotPasswordSchema, this.forgotPassword);
        this.router.post("/validate_reset_token", validateResetTokenSchema, this.validateResetToken);
        this.router.post("/reset_password", resetPasswordSchema, this.resetPassword);
        // authorized routes
        this.router.get("/", authorize([Role.Admin]), this.getAllAccounts);
        this.router.get("/:id", authorize(), this.getAccountById);
        this.router.post("/", authorize([Role.Admin]), createAccountSchema, this.createAccount);
        this.router.put("/:id", authorize(), updateRoleSchema, this.updateAccount);
        this.router.delete("/:id", authorize(), this._deleteAccount);
    }

    public authenticate = async (request: Request, response: Response, next: NextFunction) => {
        //
        const email: string = request.body.email;
        const password: string = request.body.password;
        const ipAddress: string = request.ip;
        console.log(email, password, "60rm");

        const accountDetails: IBasicDetails | ISmallError = await this.authService.authenticate(email, password, ipAddress);
        console.log(accountDetails, "63rm");
        if ("error" in accountDetails) return response.json({ error: accountDetails.error });
        if (accountDetails.jwtToken === undefined) throw new Error("jwt missing");
        if (accountDetails.refreshToken === undefined) throw new Error("refresh token missing");
        this.setTokenCookie(response, accountDetails.refreshToken);
        return response.json({ ...accountDetails, jwtToken: accountDetails.jwtToken });
    };

    public register = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const origin = request.get("origin");
            if (origin === undefined) {
                return response.status(400).json({ message: "Origin is required and was undefined" });
            }
            const accountDetails: IBasicDetails | ISmallError = await this.authService.register(request.body, origin);
            if ("error" in accountDetails) return response.json({ error: accountDetails.error });
            return response.json({
                message: "Registration successful, please check your email for verification instructions",
                accountDetails,
            });
        } catch (err) {
            console.log(err, "71rm");
            next(err);
        }
    };

    public refreshToken = async (request: Request, response: Response) => {
        const token = request.cookies.refreshToken;
        const ipAddress = request.ip;
        const { refreshToken, ...account } = await this.authService.refreshToken(token, ipAddress);

        this.setTokenCookie(response, refreshToken);
        return response.json(account);
    };

    public revokeToken = async (request: RequestWithUser, response: Response, next: NextFunction) => {
        // accept token from request body or cookie
        const token = request.body.token || request.cookies.refreshToken;
        const ipAddress = request.ip;
        if (request.user === undefined) return response.status(400).json({ message: "User is required" });
        if (!token || request.user.ownsToken === undefined) return response.status(400).json({ message: "Token is required" });
        // users can revoke their own tokens and admins can revoke any tokens
        if (!request.user.ownsToken(token) && request.user.role !== Role.Admin) {
            return response.status(401).json({ message: "Unauthorized" });
        }
        await this.authService.revokeToken(token, ipAddress);
        // .then(() => response.json({ message: "Token revoked" }))
        return response.json({ message: "Token revoked" });
    };

    public verifyEmail = async (request: Request, response: Response) => {
        const token = request.body.token;
        console.log("109rm");
        await this.authService.verifyEmail(token);
        console.log("111rm");
        return response.json({ message: "Verification successful, you can now login" });
    };

    public updatePassword = async (request: RequestWithUser, response: Response) => {
        // include email, because if we didn't, then any logged in user could
        // try to change another logged in user's pw!
        const email = request.body.email;
        const oldPw = request.body.oldPw;
        const newPw = request.body.newPw;
        const confirmNewPw = request.body.confirmNewPw;
        console.log(newPw, confirmNewPw, "126rm");
        if (newPw === undefined || confirmNewPw === undefined) return response.json({ error: "A password was missing" });
        if (newPw !== confirmNewPw) return response.json({ error: "Passwords did not match" });
        console.log("128rm");
        const success: boolean = await this.authService.updatePassword(email, oldPw, newPw);
        console.log(success, "129rm");
        if (success) return response.json({ message: "Password updated!" });
        else return response.json({ error: "You entered the wrong starting password" });
    };

    // part of a 3 step(?) flow. forgotPw => validateResetToken => resetPw
    public forgotPassword = async (request: Request, response: Response) => {
        const email = request.body.email;
        const origin = request.get("origin");
        if (origin === undefined) {
            return response.status(400).json({ message: "Origin is required and was undefined" });
        }
        await this.authService.forgotPassword(email, origin);
        return response.json({ message: "Please check your email for password reset instructions" });
    };

    public validateResetToken = async (request: Request, response: Response) => {
        const token = request.body.token;
        const success = await this.authService.validateResetToken(token);
        if (success) return response.json({ message: "Token is valid" });
        else return response.json({ message: "Invalid token" });
    };

    public resetPassword = async (request: Request, response: Response) => {
        const token = request.body.token;
        const password = request.body.password;
        const success = await this.authService.resetPassword(token, password);
        if (success) return response.json({ message: "Password reset successful, you can now login" });
        else return response.json({ message: "Reset password failed" });
    };

    // **
    // authorized routes
    // **
    public getAllAccounts = async (request: Request, response: Response) => {
        const accounts = await this.authService.getAllAccounts();
        return response.json(accounts);
    };

    public getAccountById = async (request: RequestWithUser, response: Response) => {
        const requestedAcctId = request.body.acctId;
        if (requestedAcctId !== request.user?.acctId && request.user?.role !== Role.Admin) {
            return response.status(401).json({ message: "Unauthorized" });
        }
        const idAsNumber = parseInt(request.params.id, 10);

        const account = await this.authService.getAccountById(idAsNumber);
        return account ? response.json(account) : response.sendStatus(404);
    };

    public createAccount = async (request: Request, response: Response) => {
        const account = this.authService.createAccount(request.body);
        return response.json(account);
    };

    public updateAccount = async (request: RequestWithUser, response: Response) => {
        // users can update their own account and admins can update any account
        const idOfAcctToUpdate = request.body.acctId;
        if (idOfAcctToUpdate !== request.user?.acctId && request.user?.role !== Role.Admin) {
            return response.status(401).json({ message: "Unauthorized" });
        }
        const idAsNumber = parseInt(request.params.id, 10);

        const account = this.authService.updateAccount(idAsNumber, request.body);
        return response.json(account);
    };

    public _deleteAccount = async (request: RequestWithUser, response: Response) => {
        // users can delete their own account and admins can delete any account
        const idOfAcctToDelete = request.body.acctId;
        if (request.user === undefined) return response.status(400).json({ message: "User missing" });
        if (idOfAcctToDelete !== request.user?.acctId && request.user?.role !== Role.Admin) {
            return response.status(401).json({ message: "Unauthorized" });
        }

        await this.authService.deleteAccount(request.params.id);
        return response.json({ message: "Account deleted successfully" });
    };

    public healthCheck = async () => {
        return response.json({ message: "ok" });
    };

    private setTokenCookie(response: Response, token: string) {
        // create cookie with refresh token that expires in 7 days
        const cookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        response.cookie("refreshToken", token, cookieOptions);
    }
}

export default AuthController;
