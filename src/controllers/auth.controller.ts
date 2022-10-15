import express, { Request, Response } from "express";

import {
    authenticateUserSchema,
    forgotPasswordSchema,
    registerUserSchema,
    resetPasswordSchema,
    revokeTokenSchema,
    validateResetTokenSchema,
    verifyEmailSchema,
} from "../validationSchemas/schemas";

class AuthController {
    public path = "/auth";
    public router = express.Router();

    constructor() {
        this.router.post("/authenticate", authenticateUserSchema, authenticate);
        this.router.post("/refresh_token", refreshToken);
        this.router.post("/revoke_token", authorize(), revokeTokenSchema, revokeToken);
        this.router.post("/register", registerUserSchema, register);
        this.router.post("/verify_email", verifyEmailSchema, verifyEmail);
        this.router.post("/forgot_password", forgotPasswordSchema, forgotPassword);
        this.router.post("/validate_reset_token", validateResetTokenSchema, validateResetToken);
        this.router.post("/reset_password", resetPasswordSchema, resetPassword);
        this.router.get("/", authorize(Role.Admin), getAll);
        this.router.get("/:id", authorize(), getById);
        this.router.post("/", authorize(Role.Admin), createSchema, create);
        this.router.put("/:id", authorize(), updateSchema, update);
        this.router.delete("/:id", authorize(), _delete);
    }
}
