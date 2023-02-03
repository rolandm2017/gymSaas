"use strict";
// https://javascript.plainenglish.io/a-try-catch-decorator-to-stylize-your-code-bdd0202765c8
Object.defineProperty(exports, "__esModule", { value: true });
exports.TryCatchClassDecorator = void 0;
// Decorator factory function // previously called Catch
const TryCatchClassDecorator = (errorType, handler) => {
    return (target, propertyKey, descriptor) => {
        // Method decorator
        if (descriptor) {
            return _generateDescriptor(descriptor, errorType, handler);
        }
        // Class decorator
        else {
            // Iterate over class properties except constructor
            for (const propertyName of Reflect.ownKeys(target.prototype).filter(prop => prop !== "constructor")) {
                const desc = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
                const isMethod = desc.value instanceof Function;
                if (!isMethod)
                    continue;
                Object.defineProperty(target.prototype, propertyName, _generateDescriptor(desc, errorType, handler));
            }
        }
    };
};
exports.TryCatchClassDecorator = TryCatchClassDecorator;
function _generateDescriptor(descriptor, errorType, handler) {
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
}
function _handleError(ctx, errorType, handler, error) {
    // Check if error is instance of given error type
    if (typeof handler === "function" && error instanceof errorType) {
        // Run handler with error object and class context
        handler.call(null, error, ctx);
    }
    else {
        // Throw error further
        // Next decorator in chain can catch it
        throw error;
    }
}
