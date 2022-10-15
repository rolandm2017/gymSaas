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

export {
    authenticateUserSchema,
    registerUserSchema,
    createAccountSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    validateResetTokenSchema,
    revokeTokenSchema,
};
