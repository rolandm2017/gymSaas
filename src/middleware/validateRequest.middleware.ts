import express, { NextFunction, Request, Response } from "express";

import Joi, { ObjectSchema } from "joi";

function validateRequest(req: Request, next: NextFunction, schema: ObjectSchema<any>) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        next(`Validation error: ${error.details.map(x => x.message.replaceAll('"', "")).join(", ")}`);
    } else {
        req.body = value;
        next();
    }
}
export default validateRequest;
