import Joi, { ObjectSchema } from "joi";
import { NextFunction, Request, Response } from "express";

import validateRequest from "../middleware/validateRequest.middleware";

export function feedbackSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        questionOneAnswer: Joi.string(),
        questionTwoAnswer: Joi.string(),
        largeTextAnswer: Joi.string(),
    });
    validateRequest(req, next, schema);
}
