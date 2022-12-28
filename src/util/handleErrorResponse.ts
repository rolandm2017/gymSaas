import { Response } from "express";

export function handleErrorResponse(response: Response, error: unknown) {
    // 2 benefits of using this: (1) it's always "error" never "err" or "msg". (2) lesst yping
    return response.status(400).json(error);
}
