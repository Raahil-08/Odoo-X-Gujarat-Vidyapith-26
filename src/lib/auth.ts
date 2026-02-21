import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;

    if (!auth?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing Bearer token" });
    }

    (req as any).jwt = auth.slice("Bearer ".length);
    next();
}