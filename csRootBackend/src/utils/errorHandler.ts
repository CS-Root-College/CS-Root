import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import apiError from "../utils/apiError";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json(
      new apiError(
        400,
        "Validation failed",
        err.issues
      )
    );
  }

  if (err instanceof apiError) {
    return res.status(err.statusCode).json(err);
  }

  console.error(err);

  return res.status(500).json(
    new apiError(
      500,
      "Internal server error"
    )
  );
};

export default errorHandler;