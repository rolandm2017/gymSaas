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
import { IBasicDetails } from "../interface/BasicDetails.interface";
import { handleErrorResponse } from "../util/responses/handleErrorResponse";
import { HealthCheck } from "../enum/healthCheck.enum";

class AuthController {
    public path = "/auth";
    public router = express.Router();
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
        // login & register
        this.router.post("/authenticate", authenticateUserSchema, this.authenticate.bind(this));
        this.router.post("/register", registerUserSchema, this.register);
        // verify email
        this.router.post("/verify-email", verifyEmailSchema, this.verifyEmail);
        this.router.get("/bypass-authentication-token", this.bypassEmail);
        // tokens
        this.router.post("/refresh-token", this.refreshToken);
        // note: /revoke-token === /log-out
        this.router.post("/revoke-token", authorize(), revokeTokenSchema, this.revokeToken);
        // update pw
        this.router.post("/update-password", authorize(), updatePasswordSchema, this.updatePassword);
        // pw reset
        this.router.post("/forgot-password", forgotPasswordSchema, this.forgotPassword);
        this.router.post("/validate-reset-token", validateResetTokenSchema, this.validateResetToken);
        this.router.post("/reset-password", resetPasswordSchema, this.resetPassword);
        // authorized routes
        this.router.get("/", authorize([Role.Admin]), this.getAllAccounts);
        this.router.get("/:id", authorize(), this.getAccountById);
        this.router.post("/", authorize([Role.Admin]), createAccountSchema, this.createAccount);
        this.router.put("/:id", authorize(), updateRoleSchema, this.updateAccount);
        this.router.delete("/:id", authorize(), this._deleteAccount);
        this.router.get(HealthCheck.healthCheck, this.healthCheck);
    }

    public async authenticate(request: Request, response: Response, next: NextFunction) {
        try {
            const email: string = request.body.email;
            const password: string = request.body.password;
            const ipAddress: string = request.ip;
            const accountDetails: IBasicDetails = await this.authService.authenticate(email, password, ipAddress);
            if ("error" in accountDetails) return response.json({ error: accountDetails.error });
            if (accountDetails.jwtToken === undefined) throw new Error("jwt missing");
            if (accountDetails.refreshToken === undefined) throw new Error("refresh token missing");
            this.setTokenCookie(response, accountDetails.refreshToken);
            return response.json({ ...accountDetails, jwtToken: accountDetails.jwtToken });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async register(request: Request, response: Response, next: NextFunction) {
        try {
            const origin = request.get("origin");
            if (origin === undefined) {
                return handleErrorResponse(response, "Origin is required and was undefined");
            }
            const accountDetails: IBasicDetails = await this.authService.register(request.body, origin);
            if ("error" in accountDetails) return handleErrorResponse(response, accountDetails.error);
            return response.json({
                message: "Registration successful, please check your email for verification instructions",
                accountDetails,
            });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async refreshToken(request: Request, response: Response) {
        try {
            const token = request.cookies.refreshToken;
            const ipAddress = request.ip;
            const { refreshToken, ...account } = await this.authService.refreshToken(token, ipAddress);
            this.setTokenCookie(response, refreshToken);
            return response.json(account);
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async revokeToken(request: RequestWithUser, response: Response, next: NextFunction) {
        try {
            // accept token from request body or cookie
            const token = request.body.token || request.cookies.refreshToken;
            const ipAddress = request.ip;
            if (request.user === undefined) return handleErrorResponse(response, "User is required");
            if (!token || request.user.ownsToken === undefined) return handleErrorResponse(response, "Token is required");
            // users can revoke their own tokens and admins can revoke any tokens
            if (!request.user.ownsToken(token) && request.user.role !== Role.Admin) {
                return response.status(401).json({ message: "Unauthorized" });
            }
            await this.authService.revokeToken(token, ipAddress);
            // .then(() response.json({ message: "Token revoked" }))
            return response.json({ message: "Token revoked" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async verifyEmail(request: Request, response: Response) {
        try {
            const token = request.body.token;
            await this.authService.verifyEmail(token);
            return response.json({ message: "Verification successful, you can now login" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async bypassEmail(request: Request, response: Response) {
        try {
            const email = request.body.email;
            await this.authService.logVerificationToken(email);
            return response.status(200).json({ message: "success" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async updatePassword(request: RequestWithUser, response: Response) {
        try {
            // include email, because if we didn't, then any logged in user could
            // try to change another logged in user's pw!
            const email = request.body.email;
            const oldPw = request.body.oldPw;
            const newPw = request.body.newPw;
            const confirmNewPw = request.body.confirmNewPw;
            if (newPw === undefined || confirmNewPw === undefined) return response.json({ error: "A password was missing" });
            if (newPw !== confirmNewPw) return response.json({ error: "Passwords did not match" });
            const success: boolean = await this.authService.updatePassword(email, oldPw, newPw);
            if (success) return response.json({ message: "Password updated!" });
            else return response.json({ error: "You entered the wrong starting password" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    // part of a 3 step(?) flow. forgotPw => validateResetToken => resetPw
    public async forgotPassword(request: Request, response: Response) {
        try {
            const email = request.body.email;
            const origin = request.get("origin");
            if (origin === undefined) {
                return handleErrorResponse(response, "Origin is required and was undefined");
            }
            await this.authService.forgotPassword(email, origin);
            return response.json({ message: "Please check your email for password reset instructions" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async validateResetToken(request: Request, response: Response) {
        try {
            const token = request.body.token;
            const success = await this.authService.validateResetToken(token);
            if (success) return response.json({ message: "Token is valid" });
            else return response.json({ message: "Invalid token" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async resetPassword(request: Request, response: Response) {
        try {
            const token = request.body.token;
            const password = request.body.password;
            const success = await this.authService.resetPassword(token, password);
            if (success) return response.json({ message: "Password reset successful, you can now login" });
            else return response.json({ message: "Reset password failed" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    // **
    // authorized routes
    // **
    public async getAllAccounts(request: Request, response: Response) {
        try {
            const accounts = await this.authService.getAllAccounts();
            return response.json(accounts);
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async getAccountById(request: RequestWithUser, response: Response) {
        try {
            const requestedAcctId = request.body.acctId;
            if (requestedAcctId !== request.user?.acctId && request.user?.role !== Role.Admin) {
                return response.status(401).json({ message: "Unauthorized" });
            }
            const idAsNumber = parseInt(requestedAcctId, 10);

            const account = await this.authService.getAccountById(idAsNumber);
            return account ? response.json(account) : response.sendStatus(404);
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async createAccount(request: Request, response: Response) {
        try {
            const account = this.authService.createAccount(request.body);
            return response.json(account);
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async updateAccount(request: RequestWithUser, response: Response) {
        try {
            // users can update their own account and admins can update any account
            const idOfAcctToUpdate = request.body.acctId;
            if (idOfAcctToUpdate !== request.user?.acctId && request.user?.role !== Role.Admin) {
                return response.status(401).json({ message: "Unauthorized" });
            }
            const idAsNumber = parseInt(idOfAcctToUpdate, 10);

            const account = this.authService.updateAccount(idAsNumber, request.body);
            return response.json(account);
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async _deleteAccount(request: RequestWithUser, response: Response) {
        try {
            // users can delete their own account and admins can delete any account
            const idOfAcctToDelete = request.body.acctId;
            if (request.user === undefined) return handleErrorResponse(response, "User missing");
            if (idOfAcctToDelete !== request.user?.acctId && request.user?.role !== Role.Admin) {
                return response.status(401).json({ message: "Unauthorized" });
            }

            await this.authService.deleteAccount(request.params.id);
            return response.json({ message: "Account deleted successfully" });
        } catch (err) {
            return handleErrorResponse(response, err);
        }
    }

    public async healthCheck(request: Request, response: Response) {
        return response.json({ message: "ok" });
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
