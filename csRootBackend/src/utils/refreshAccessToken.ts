
import type { Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import apiError from "./apiError";
import generateAccessAndRefreshTokens from "./jwt";

const refreshAccessToken = async (
    refreshToken: string,
    res: Response,
    platform: "app" | "website" = "website"
) => {
    const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
    ) as {
        _id: string;
    };

    const user = await User.findById(decoded._id);

    if (!user) {
        throw new apiError(401, "Invalid refresh token");
    }

    const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken || ""
    );

    if (!isRefreshTokenValid) {
        throw new apiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"
            ? "none" as const
            : "lax" as const,
    };

    if (platform === "website") {
        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", newRefreshToken, {
            ...cookieOptions,
            maxAge: 14 * 24 * 60 * 60 * 1000,
        });
    } else {
        res.setHeader("x-access-token", accessToken);
        res.setHeader("x-refresh-token", newRefreshToken);
    }

    return await User.findById(user._id).select(
        "-password -refreshToken"
    );
};

export default refreshAccessToken;
