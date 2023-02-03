"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateRequest(req, next, schema) {
    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true, // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        const err = new Error(`Validation error: ${error.details.map(x => x.message.replaceAll('"', "")).join(", ")}`);
        err.name = "ValidationError";
        next(err);
    }
    else {
        req.body = value;
        next();
    }
}
exports.default = validateRequest;
