// source of solution: https://stackoverflow.com/questions/37377731/extend-express-request-object-using-typescript

declare namespace Express {
    interface Request {
        // This property is added in the authorize.middleware.ts to
        // inform the controller of who is making the request.
        user?: {
            role: string;
            ownsToken?: Function;
            acctId: number;
        };
        // This property comes into the system from the jwt in authorize.middleware.ts.
        auth?: {
            sub: any;
            acctId: number;
        };
    }
}

// This file is some typescript wizardry to make the compiler comprehend
// the addition of a user and auth property to the Request object from Express.
