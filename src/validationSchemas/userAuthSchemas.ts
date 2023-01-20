import Joi, { ObjectSchema } from "joi";
import express, { NextFunction, Request, Response } from "express";
import validateRequest from "../middleware/validateRequest.middleware";
import { Role } from "../enum/role.enum";

function isEmail(maybeEmail: string): boolean {
    const schema: ObjectSchema = Joi.object({ email: Joi.string().email().required() });
    const { error, value } = schema.validate({ email: maybeEmail });
    if (error) return false;
    else return true;
}

function authenticateUserSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function registerUserSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        name: Joi.string().min(5).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
        acceptsTerms: Joi.boolean().valid(true).required(),
    });
    validateRequest(req, next, schema);
}

function updatePasswordSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
        oldPw: Joi.string().min(6).required(),
        newPw: Joi.string().min(6).required(),
        confirmNewPw: Joi.string().min(6).required(),
    });
    validateRequest(req, next, schema);
}

function createAccountSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        // title: Joi.string().required(),
        // firstName: Joi.string().required(),
        // lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
        role: Joi.string().valid(Role.Admin, Role.User).required(),
    });
    validateRequest(req, next, schema);
}

// function verifyEmailSchema(req: Request, res: Response, next: NextFunction) {
//     const schema: ObjectSchema = Joi.object({
//         token: Joi.string().required(),
//     });
//     validateRequest(req, next, schema);
// }

function forgotPasswordSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        email: Joi.string().email().required(),
    });
    validateRequest(req, next, schema);
}

function resetPasswordSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    });
    validateRequest(req, next, schema);
}

function validateResetTokenSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        token: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function revokeTokenSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        token: Joi.string().empty(""),
    });
    validateRequest(req, next, schema);
}

function updateRoleSchema(req: Request, res: Response, next: NextFunction) {
    interface rolesUpdateSchema {
        // defined here explicitly only so that TS doesn't whine when .role property is added
        // title: Joi.StringSchema<string>;
        // firstName: Joi.StringSchema<string>;
        // lastName: Joi.StringSchema<string>;
        email: Joi.StringSchema<string>;
        password: Joi.StringSchema<string>;
        confirmPassword: Joi.StringSchema<string>;
        role?: Joi.StringSchema<string>;
    }

    const schemaRules: rolesUpdateSchema = {
        // title: Joi.string().empty(""),
        // firstName: Joi.string().empty(""),
        // lastName: Joi.string().empty(""),
        email: Joi.string().email().empty(""),
        password: Joi.string().min(6).empty(""),
        confirmPassword: Joi.string().valid(Joi.ref("password")).empty(""),
    };

    // only admins can update role
    if (req.user?.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty("");
    }

    const schema = Joi.object(schemaRules).with("password", "confirmPassword");
    validateRequest(req, next, schema);
}

export {
    isEmail,
    authenticateUserSchema,
    registerUserSchema,
    createAccountSchema,
    verifyEmailSchema,
    updatePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    validateResetTokenSchema,
    revokeTokenSchema,
    updateRoleSchema,
};
