import { Response } from "express";

export function handleErrorResponse(response: Response, error: unknown) {
    // 2 benefits of using this: (1) it's always "error" never "err" or "msg". (2) lesst yping
    console.log(error, "5rm");
    if (error instanceof Error) {
        console.log(error.name, "7rm");
        console.log(error.message, "8rm");
        return response.status(400).json({ status: "Error", name: error.name, message: error.message });
    }
    return response.status(400).json(error);
}
