import { Response } from "express";

export function handleErrorResponse(response: Response, error: unknown) {
    // 2 benefits of using this: (1) it's always "error" never "err" or "msg". (2) lesst yping
    console.log(error, "in handleErrorResponse");
    if (error instanceof Error) {
        return response.status(400).json({ error: { name: error.name, message: error.message } });
    }
    return response.status(400).json(error);
}
