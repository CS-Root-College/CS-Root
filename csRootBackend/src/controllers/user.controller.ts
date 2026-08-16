import type { Request, Response } from "express";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";
import { User } from "../models/user.model";
import { verifyEmailLayout } from "../emailLayouts/emailVerification";
import sendEmail from "../service/sendEmail.js";
import crypto from "crypto";
import { verifyTwoFactorLayout } from "../emailLayouts/twoStepVerification";
import { userValidation } from "../validation/user.validation";

const registerEmail = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  userValidation.username.parse(username);
  userValidation.email.parse(email);
  userValidation.password.parse(password);

  return res
    .status(200)
    .json(new apiResponse(200, "Please verify your email", email));
};

export { registerEmail };
