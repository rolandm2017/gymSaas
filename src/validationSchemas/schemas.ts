import Joi, { ObjectSchema } from "joi";
import express, { NextFunction, Request, Response } from "express";
import validateRequest from "../middleware/validate-request.middleware";

function authenticateUserSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema<any> = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function registerUserSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema<any> = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
        acceptTerms: Joi.boolean().valid(true).required(),
    });
    validateRequest(req, next, schema);
}

function createAccountSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema<any> = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
        role: Joi.string().valid(Role.Admin, Role.User).required(),
    });
    validateRequest(req, next, schema);
}

function verifyEmailSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema<any> = Joi.object({
        token: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function forgotPasswordSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema<any> = Joi.object({
        email: Joi.string().email().required(),
    });
    validateRequest(req, next, schema);
}

function resetPasswordSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema<any> = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    });
    validateRequest(req, next, schema);
}

function validateResetTokenSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema<any> = Joi.object({
        token: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function revokeTokenSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema<any> = Joi.object({
        token: Joi.string().empty(""),
    });
    validateRequest(req, next, schema);
}

function updateRoleSchema(req: Request, res: Response, next: NextFunction) {
    const schemaRules = {
        title: Joi.string().empty(""),
        firstName: Joi.string().empty(""),
        lastName: Joi.string().empty(""),
        email: Joi.string().email().empty(""),
        password: Joi.string().min(6).empty(""),
        confirmPassword: Joi.string().valid(Joi.ref("password")).empty(""),
    };

    // only admins can update role
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty("");
    }

    const schema = Joi.object(schemaRules).with("password", "confirmPassword");
    validateRequest(req, next, schema);
}

export {
    authenticateUserSchema,
    registerUserSchema,
    createAccountSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    validateResetTokenSchema,
    revokeTokenSchema,
    updateRoleSchema,
};
