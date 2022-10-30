import { Request } from "express";

export interface RequestWithUser extends Request {
    user?: {
        role: string;
        ownsToken?: Function;
        acctId: number;
    };
    auth?: {
        sub: any;
        acctId: number;
    };
}
