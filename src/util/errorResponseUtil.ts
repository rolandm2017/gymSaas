import { Response } from "express";

export function errorResponse(response: Response, message: string) {
    // 2 benefits of using this: (1) it's always "error" never "err" or "msg". (2)
    return response.status(400).json({ error: message });
}
