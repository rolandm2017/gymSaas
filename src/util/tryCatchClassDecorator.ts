// https://javascript.plainenglish.io/a-try-catch-decorator-to-stylize-your-code-bdd0202765c8

type HandlerFunction = (error: any, ctx: any) => void;

// Decorator factory function // previously called Catch
export const TryCatchClassDecorator = (errorType: any, handler: HandlerFunction): any => {
    console.log("decraoting", errorType, "9rm");
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // Method decorator
        // console.log(target, Reflect.ownKeys(target.prototype), Object.getOwnPropertyNames(target.prototype), "12rm");
        if (descriptor) {
            return _generateDescriptor(descriptor, errorType, handler);
        }
        // Class decorator
        else {
            console.log(target, target.constructor, "17rm");
            console.log(target.prototype, "18rm"); // fixme: target.prototype is empty! // fails!
            console.log(Object.getOwnPropertyNames(target), "19rm");
            console.log(Reflect.ownKeys(target.prototype), "20rm");
            console.log(
                Reflect.ownKeys(target.prototype).filter(prop => prop !== "constructor"),
                "23rm",
            );
            console.log(Object.getPrototypeOf(target), "27rm");
            // Iterate over class properties except constructor
            for (const propertyName of Reflect.ownKeys(target.prototype).filter(prop => prop !== "constructor")) {
                console.log(propertyName, "21rm");
                const desc = Object.getOwnPropertyDescriptor(target.prototype, propertyName)!;
                console.log(desc, errorType, "19rm");
                const isMethod = desc.value instanceof Function;
                if (!isMethod) continue;
                Object.defineProperty(target.prototype, propertyName, _generateDescriptor(desc, errorType, handler));
            }
        }
    };
};

function _generateDescriptor(descriptor: PropertyDescriptor, errorType: any, handler: HandlerFunction): PropertyDescriptor {
    // Save a reference to the original method
    const originalMethod = descriptor.value;

    console.log("here 33rm");
    // Rewrite original method with try/catch wrapper
    descriptor.value = function (...args: any[]) {
        try {
            console.log(args, "32rm");
            const result = originalMethod.apply(this, args);

            // Check if method is asynchronous
            if (result && result instanceof Promise) {
                // Return promise
                return result.catch((error: any) => {
                    _handleError(this, errorType, handler, error);
                });
            }

            // Return actual result
            return result;
        } catch (error) {
            if (error instanceof Error) {
                _handleError(this, errorType, handler, error);
            }
        }
    };

    return descriptor;
}

function _handleError(ctx: any, errorType: any, handler: HandlerFunction, error: Error) {
    // Check if error is instance of given error type
    if (typeof handler === "function" && error instanceof errorType) {
        // Run handler with error object and class context
        handler.call(null, error, ctx);
    } else {
        // Throw error further
        // Next decorator in chain can catch it
        throw error;
    }
}
