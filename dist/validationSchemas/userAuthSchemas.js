"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoleSchema = exports.revokeTokenSchema = exports.validateResetTokenSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.updatePasswordSchema = exports.createAccountSchema = exports.registerUserSchema = exports.authenticateUserSchema = exports.isEmail = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest_middleware_1 = __importDefault(require("../middleware/validateRequest.middleware"));
const role_enum_1 = require("../enum/role.enum");
function isEmail(maybeEmail) {
    const schema = joi_1.default.object({ email: joi_1.default.string().email().required() });
    const { error, value } = schema.validate({ email: maybeEmail });
    if (error)
        return false;
    else
        return true;
}
exports.isEmail = isEmail;
function authenticateUserSchema(req, res, next) {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.authenticateUserSchema = authenticateUserSchema;
function registerUserSchema(req, res, next) {
    const schema = joi_1.default.object({
        name: joi_1.default.string().min(5).required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).required(),
        acceptsTerms: joi_1.default.boolean().valid(true).required(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.registerUserSchema = registerUserSchema;
function updatePasswordSchema(req, res, next) {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        oldPw: joi_1.default.string().min(6).required(),
        newPw: joi_1.default.string().min(6).required(),
        confirmNewPw: joi_1.default.string().min(6).required(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.updatePasswordSchema = updatePasswordSchema;
function createAccountSchema(req, res, next) {
    const schema = joi_1.default.object({
        // title: Joi.string().required(),
        // firstName: Joi.string().required(),
        // lastName: Joi.string().required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).required(),
        role: joi_1.default.string().valid(role_enum_1.Role.Admin, role_enum_1.Role.User).required(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.createAccountSchema = createAccountSchema;
// function verifyEmailSchema(req: Request, res: Response, next: NextFunction) {
//     const schema: ObjectSchema = Joi.object({
//         token: Joi.string().required(),
//     });
//     validateRequest(req, next, schema);
// }
function forgotPasswordSchema(req, res, next) {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.forgotPasswordSchema = forgotPasswordSchema;
function resetPasswordSchema(req, res, next) {
    const schema = joi_1.default.object({
        token: joi_1.default.string().required(),
        password: joi_1.default.string().min(6).required(),
        confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).required(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.resetPasswordSchema = resetPasswordSchema;
function validateResetTokenSchema(req, res, next) {
    const schema = joi_1.default.object({
        token: joi_1.default.string().required(),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.validateResetTokenSchema = validateResetTokenSchema;
function revokeTokenSchema(req, res, next) {
    const schema = joi_1.default.object({
        token: joi_1.default.string().empty(""),
    });
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.revokeTokenSchema = revokeTokenSchema;
function updateRoleSchema(req, res, next) {
    var _a;
    const schemaRules = {
        // title: Joi.string().empty(""),
        // firstName: Joi.string().empty(""),
        // lastName: Joi.string().empty(""),
        email: joi_1.default.string().email().empty(""),
        password: joi_1.default.string().min(6).empty(""),
        confirmPassword: joi_1.default.string().valid(joi_1.default.ref("password")).empty(""),
    };
    // only admins can update role
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === role_enum_1.Role.Admin) {
        schemaRules.role = joi_1.default.string().valid(role_enum_1.Role.Admin, role_enum_1.Role.User).empty("");
    }
    const schema = joi_1.default.object(schemaRules).with("password", "confirmPassword");
    (0, validateRequest_middleware_1.default)(req, next, schema);
}
exports.updateRoleSchema = updateRoleSchema;
