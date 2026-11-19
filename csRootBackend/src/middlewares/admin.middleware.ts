
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware";
import { hasAdminAccess } from "../utils/hasAdminAccess";
import apiError from "../utils/apiError";

export const adminOnly = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!hasAdminAccess(req.user)) {
        throw new apiError(403, "Access denied. Admin privileges required.");
    }

    next();
};