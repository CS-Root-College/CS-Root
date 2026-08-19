import type { Request, Response } from "express";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";
import { User } from "../models/user.model";
import { verifyEmailLayout } from "../emailLayouts/emailVerification";
import sendEmail from "../service/sendEmail.js";
import crypto from "crypto";
import { verifyTwoFactorLayout } from "../emailLayouts/twoStepVerification";
import { userValidation } from "../validation/user.validation";
import redis from "../config/redis";
import bcrypt from "bcryptjs";
import generateAccessAndRefreshTokens from "../utils/jwt";
import { welcomeEmailLayout } from "../emailLayouts/welcomeEmail";

const registerEmail = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  userValidation.username.parse(username);
  userValidation.email.parse(email);
  userValidation.password.parse(password);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new apiError(
      400,
      "User already exist with the same email or username",
    );
  }

  //Redis exists
  const [otpExists, registrationExists, usernameExists] = await Promise.all([
    redis.exists(`otp:${email}`),
    redis.exists(`registerationData:${email}`),
    redis.exists(`pendingUsername:${username}`),
  ]);

  if (otpExists) {
    throw new apiError(
      400,
      "An OTP has already been sent to this email. Please verify your account first.",
    );
  }

  if (registrationExists) {
    throw new apiError(
      400,
      "A registration request already exists for this email.",
    );
  }

  if (usernameExists) {
    throw new apiError(
      400,
      "This username is currently reserved by another pending registration.",
    );
  }

  //Main logic/Building logic

  const hashedPassword = await bcrypt.hash(password, 10);

  const registerUserInfo = {
    email,
    username,
    password: hashedPassword,
  };

  await redis.set(`otp:${email}`, otp, "EX", 600);

  await redis.set(
    `registerationData:${email}`,
    JSON.stringify(registerUserInfo),
    "EX",
    600,
  );
  await redis.set(`pendingUsername:${username}`, username, "EX", 600);

  await sendEmail({
    email,
    subject: "Verify Your CS Root Account",
    layout: verifyEmailLayout(username, otp),
  });

  return res
    .status(200)
    .json(
      new apiResponse(200, "Please verify your email", email)
    );
};

const verifyEmail = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp) {
        throw new apiError(
            400,
            "Otp expired or not found. Please request a new one."
        );
    }

    if (storedOtp !== otp) {
        throw new apiError(400, "Incorrect otp");
    }

    const registeredUserData = await redis.get(
        `registerationData:${email}`
    );

    if (!registeredUserData) {
        throw new apiError(
            400,
            "Registration session expired. Please register again."
        );
    }

    const userData = JSON.parse(registeredUserData);

    const user = await User.create({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        isEmailVerified: true,
        authProvider: "email"
    });

    await redis.del(
        `otp:${email}`,
        `registerationData:${email}`,
        `pendingUsername:${userData.username}`
    );

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
    };

    try {
        await sendEmail({
            email,
            subject: "Welcome to CS Root",
            layout: welcomeEmailLayout(user.username)
        })
    } catch (error) {
        console.error("Failed to send welcome email:", error);
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 14 * 24 * 60 * 60 * 1000,
        })
        .json(
            new apiResponse(
                200,
                "Welcome! User registered successfully.",
                {
                    user: {
                        _id: user._id,
                        email: user.email,
                        username: user.username,
                    },
                }
            )
        );
};


export { 
  registerEmail,
  verifyEmail

};