
import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware";
import apiError from "../utils/apiError";

const requireAdmin = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new apiError(401, "Authentication required"));
  }

  if (req.user.role !== "admin") {
    return next(
      new apiError(403, "Only administrators can manage articles")
    );
  }

  return next();
};

export default requireAdmin;
