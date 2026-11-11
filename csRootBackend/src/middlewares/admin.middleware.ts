import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware";
import apiError from "../utils/apiError";

const verifyAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        throw new apiError(401, "Unauthorized access.");
    }

    if (req.user.role !== "admin") {
        throw new apiError(403, "Access denied. Admin only.");
    }

    return next();
};

export default verifyAdmin;