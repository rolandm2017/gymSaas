import express, { NextFunction, Request, Response } from "express";

import {
    authenticateUserSchema,
    createAccountSchema,
    forgotPasswordSchema,
    registerUserSchema,
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

class AuthController {
    public path = "/auth";
    public router = express.Router();

    constructor(private authService: AuthService) {
        // login & register
        this.router.post("/authenticate", authenticateUserSchema, this.authenticate);
        this.router.post("/register", registerUserSchema, this.register);
        // todo: log out route
        // tokens
        this.router.post("/refresh_token", this.refreshToken);
        this.router.post("/revoke_token", authorize(), revokeTokenSchema, this.revokeToken);
        // verify email
        this.router.post("/verify_email", verifyEmailSchema, this.verifyEmail);
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

    public async authenticate(request: Request, response: Response) {
        //
        const email: string = request.body.email;
        const password: string = request.body.password;
        const ipAddress: string = request.ip;
        this.authService.authenticate(email, password, ipAddress);
    }

    public async register(request: Request, response: Response, next: NextFunction) {
        const origin = request.get("origin");
        if (origin === undefined) {
            return response.status(400).json({ message: "Origin is required and was undefined" });
        }
        await this.authService.register(request.body, origin);
        // .then(() => response.json({ message: 'Registration successful, please check your email for verification instructions' }))
        return response.json({ message: "Registration successful, please check your email for verification instructions" });
        // .catch(next);
        // todo: find out what watmore does w/ "catch(next)"
    }

    public async refreshToken(request: Request, response: Response) {
        //
        const token = request.cookies.refreshToken;
        const ipAddress = request.ip;
        const { refreshToken, ...account } = await this.authService.refreshToken(token, ipAddress);
        // .then(({ refreshToken, ...account }) => {
        //     setTokenCookie(res, refreshToken);
        //     response.json(account);
        // })
        this.setTokenCookie(response, refreshToken);
        response.json(account);
        // .catch(next);
    }

    public async revokeToken(request: RequestWithUser, response: Response) {
        //
        const token = request.body.token || request.cookies.refreshToken;
        const ipAddress = request.ip;
        if (request.user === undefined) return response.status(400).json({ message: "User is required" });
        if (!token) return response.status(400).json({ message: "Token is required" });
        // users can revoke their own tokens and admins can revoke any tokens
        if (!request.user.ownsToken(token) && request.user.role !== Role.Admin) {
            return response.status(401).json({ message: "Unauthorized" });
        }
        await this.authService.revokeToken(token, ipAddress);
        // .then(() => response.json({ message: "Token revoked" }))
        return response.json({ message: "Token revoked" });
        // .catch(next);
    }

    public async verifyEmail(request: Request, response: Response) {
        const token = request.body.token;
        await this.authService.verifyEmail(token);
        // .then(() => response.json({ message: 'Verification successful, you can now login' }))
        return response.json({ message: "Verification successful, you can now login" });
        // .catch(next);
    }

    public async forgotPassword(request: Request, response: Response) {
        const email = request.body.email;
        const origin = request.get("origin");
        if (origin === undefined) {
            return response.status(400).json({ message: "Origin is required and was undefined" });
        }
        await this.authService.forgotPassword(email, origin);
        return response.json({ message: "Please check your email for password reset instructions" });
        // .catch(next);
    }

    public async validateResetToken(request: Request, response: Response) {
        const token = request.body.token;
        await this.authService.validateResetToken(token);
        return response.json({ message: "Token is valid" });
        // .catch(next);
    }

    public async resetPassword(request: Request, response: Response) {
        const token = request.body.token;
        const password = request.body.password;
        this.authService.resetPassword(token, password).then(() => response.json({ message: "Password reset successful, you can now login" }));
        // .catch(next);
    }

    // **
    // authorized routes
    // **
    public async getAllAccounts(request: Request, response: Response) {
        const accounts = await this.authService.getAllAccounts();
        return response.json(accounts);
        // .catch(next);
    }

    public async getAccountById(request: RequestWithUser, response: Response) {
        if (request.params.id !== request.user?.id && request.user?.role !== Role.Admin) {
            return response.status(401).json({ message: "Unauthorized" });
        }
        const idAsNumber = parseInt(request.params.id, 10);

        const account = await this.authService.getAccountById(idAsNumber);
        return account ? response.json(account) : response.sendStatus(404);
        // .catch(next);
    }

    public async createAccount(request: Request, response: Response) {
        const account = this.authService.createAccount(request.body);
        return response.json(account);
        // .catch(next);
    }

    public async updateAccount(request: RequestWithUser, response: Response) {
        // users can update their own account and admins can update any account
        if (request.params.id !== request.user?.id && request.user?.role !== Role.Admin) {
            return response.status(401).json({ message: "Unauthorized" });
        }
        const idAsNumber = parseInt(request.params.id, 10);

        const account = this.authService.updateAccount(idAsNumber, request.body);
        return response.json(account);
        // .catch(next);
    }

    public async _deleteAccount(request: RequestWithUser, response: Response) {
        // users can delete their own account and admins can delete any account
        if (request.user === undefined) return response.status(400).json({ message: "User missing" });
        if (request.params.id !== request.user?.id && request.user?.role !== Role.Admin) {
            return response.status(401).json({ message: "Unauthorized" });
        }

        await this.authService.deleteAccount(request.params.id);
        return response.json({ message: "Account deleted successfully" });
        // .catch(next);
    }

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
