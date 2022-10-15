import { Request } from "express";

export interface RequestWithUser extends Request {
    user: {
        role: string;
        ownsToken: any;
        id: any;
    };
}
