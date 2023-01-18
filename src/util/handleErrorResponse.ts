import { Response } from "express";

export function handleErrorResponse(response: Response, error: unknown) {
    // 2 benefits of using this: (1) it's always "error" never "err" or "msg". (2) lesst yping
    console.log(error, "5rm");
    if (error instanceof Error) {
        console.log(error.name, error.message, "6rm");
        return response.status(400).json(error);
    }
    return response.status(400).json(error);
}
