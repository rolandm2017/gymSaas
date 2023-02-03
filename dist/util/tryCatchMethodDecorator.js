"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatchErrors = exports.TryCatchMethodDecorator = void 0;
// previously called Catch
const TryCatchMethodDecorator = (errorType, handler) => {
    return (target, propertyKey, descriptor) => {
        // Save a reference to the original method
        const originalMethod = descriptor.value;
        // Rewrite original method with try/catch wrapper
        descriptor.value = function (...args) {
            try {
                const result = originalMethod.apply(this, args);
                // Check if method is asynchronous
                if (result && result instanceof Promise) {
                    // Return promise
                    return result.catch((error) => {
                        _handleError(this, errorType, handler, error);
                    });
                }
                // Return actual result
                return result;
            }
            catch (error) {
                if (error instanceof Error) {
                    _handleError(this, errorType, handler, error);
                }
            }
        };
        return descriptor;
    };
};
exports.TryCatchMethodDecorator = TryCatchMethodDecorator;
const CatchErrors = (handler) => (0, exports.TryCatchMethodDecorator)(Error, handler);
exports.CatchErrors = CatchErrors;
function _handleError(context, errorType, handler, error) {
    // Check if error is instance of given error type
    if (typeof handler === "function" && error instanceof errorType) {
        // Run handler with error object and class context
        handler.call(null, error, context);
    }
    else {
        // Throw error further
        // Next decorator in chain can catch it
        throw error;
    }
}
