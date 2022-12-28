import Joi, { ObjectSchema } from "joi";
import { NextFunction, Request, Response } from "express";

import validateRequest from "../middleware/validateRequest.middleware";

export function detectViewportWidthSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        city: Joi.string(),
        state: Joi.string(),
        provider: Joi.string(),
    });
    validateRequest(req, next, schema);
}

export function getHousingByCityIdAndBatchNumSchema(req: Request, res: Response, next: NextFunction) {
    const schema: ObjectSchema = Joi.object({
        batchNum: Joi.number(),
        cityId: Joi.number(),
    });
    validateRequest(req, next, schema);
}
