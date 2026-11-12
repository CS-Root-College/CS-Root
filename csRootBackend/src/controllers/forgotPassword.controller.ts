import type { Request, Response } from "express";
import { randomInt, randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";

import { User } from "../models/user.model";
import redis from "../config/redis";
import sendEmail from "../service/sendEmail.js";
import { userValidation } from "../validation/user.validation";

const OTP_TTL = 300; // 5 minutes
const SESSION_TTL = 600; // 10 minutes

const hashValue = (value: string) =>
    createHash("sha256").update(value).digest("hex");

const requestPasswordReset = async (
    req: Request,
    res: Response
) => {
    const parsedEmail = userValidation.email.safeParse(req.body.email);

    if (!parsedEmail.success) {
        res.status(400).json({
            success: false,
            message: "Please provide a valid email address.",
        });
        return;
    }

    const email = parsedEmail.data;

    // Basic resend cooldown, shared across requests.
    const cooldownKey = `passwordReset:cooldown:${email}`;
    const canSend = await redis.set(
        cooldownKey,
        "1",
        "EX",
        60,
        "NX"
    );

    if (!canSend) {
        res.status(429).json({
            success: false,
            message: "Please wait before requesting another OTP.",
        });
        return;
    }

    const user = await User.findOne({ email });

    // Avoid revealing whether an account exists.
    if (!user || !user.password || user.authProvider === "github") {
        res.status(200).json({
            success: true,
            message: "If an eligible account exists, an OTP will be sent.",
        });
        return;
    }

    const otp = randomInt(100000, 1000000).toString();

    try {
        await redis.set(
            `passwordReset:otp:${email}`,
            hashValue(otp),
            "EX",
            OTP_TTL
        );

        await redis.del(`passwordReset:attempts:${email}`);

        await sendEmail({
            email,
            subject: "Reset Your CS Root Password",
            layout: `
                <div style="font-family:Arial,sans-serif">
                    <h2>Password Reset</h2>
                    <p>Use this OTP to reset your CS Root password:</p>
                    <h1 style="letter-spacing:8px">${otp}</h1>
                    <p>This code expires in 5 minutes.</p>
                    <p>If you did not request this, ignore this email.</p>
                </div>
            `,
        });

        res.status(200).json({
            success: true,
            message: "If an eligible account exists, an OTP will be sent.",
        });
    } catch (error) {
        await redis.del(
            `passwordReset:otp:${email}`,
            `passwordReset:cooldown:${email}`
        );

        throw error;
    }
};

const verifyPasswordResetOtp = async (
    req: Request,
    res: Response
) => {
    const emailResult = userValidation.email.safeParse(req.body.email);
    const otpResult = userValidation.otp.safeParse(req.body.otp);

    if (!emailResult.success || !otpResult.success) {
        res.status(400).json({
            success: false,
            message: "A valid email and six-digit OTP are required.",
        });
        return;
    }

    const email = emailResult.data;
    const otp = otpResult.data;

    const otpKey = `passwordReset:otp:${email}`;
    const attemptsKey = `passwordReset:attempts:${email}`;

    const attempts = await redis.incr(attemptsKey);

    if (attempts === 1) {
        await redis.expire(attemptsKey, OTP_TTL);
    }

    if (attempts > 5) {
        await redis.del(otpKey);
        res.status(429).json({
            success: false,
            message: "Too many attempts. Request a new OTP.",
        });
        return;
    }

    const storedHash = await redis.get(otpKey);

    if (!storedHash || storedHash !== hashValue(otp)) {
        res.status(400).json({
            success: false,
            message: "Invalid or expired OTP.",
        });
        return;
    }

    await redis.del(otpKey, attemptsKey);

    // Issue a separate, short-lived reset token only after OTP verification.
    const resetToken = randomBytes(32).toString("hex");

    await redis.set(
        `passwordReset:session:${hashValue(resetToken)}`,
        email,
        "EX",
        SESSION_TTL
    );

    res.status(200).json({
        success: true,
        message: "OTP verified. You can now reset your password.",
        resetToken,
    });
};

const resetPassword = async (
    req: Request,
    res: Response
) => {
    const emailResult = userValidation.email.safeParse(req.body.email);
    const passwordResult = userValidation.newPassword.safeParse(
        req.body.newPassword
    );

    const { resetToken } = req.body;

    if (
        !emailResult.success ||
        !passwordResult.success ||
        typeof resetToken !== "string" ||
        !/^[a-f0-9]{64}$/.test(resetToken)
    ) {
        res.status(400).json({
            success: false,
            message: "Please provide valid reset details and a password.",
        });
        return;
    }

    const email = emailResult.data;
    const sessionKey =
        `passwordReset:session:${hashValue(resetToken)}`;

    const verifiedEmail = await redis.get(sessionKey);

    if (!verifiedEmail || verifiedEmail !== email) {
        res.status(400).json({
            success: false,
            message: "Reset session is invalid or expired. Verify your OTP again.",
        });
        return;
    }

    const user = await User.findOne({ email });

    if (!user || !user.password || user.authProvider === "github") {
        await redis.del(sessionKey);

        res.status(400).json({
            success: false,
            message: "Unable to reset this account's password.",
        });
        return;
    }

    const hashedPassword = await bcrypt.hash(
        passwordResult.data,
        12
    );

    user.password = hashedPassword;

    // Invalidate the existing refresh token.
   user.refreshToken = "";
    await user.save();

    await redis.del(
        sessionKey,
        `refreshToken:${user._id}`,
        `passwordReset:otp:${email}`,
        `passwordReset:attempts:${email}`
    );

    res.status(200).json({
        success: true,
        message: "Password reset successfully. Please log in again.",
    });
};

export {
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword,
};
