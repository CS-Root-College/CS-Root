import type { Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import apiError from "./apiError";

const refreshAccessToken = async (
    refreshToken: string,
    res: Response
) => {

    const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
    ) as {
        _id: string;
    };

    const user = await User.findById(
        decoded._id
    );

    if (!user) {
        throw new apiError(
            401,
            "Invalid refresh token"
        );
    }

    const isRefreshTokenValid =
        await bcrypt.compare(
            refreshToken,
            user.refreshToken || ""
        );

    if (!isRefreshTokenValid) {
        throw new apiError(
            401,
            "Invalid refresh token"
        );
    }

    const accessToken = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            username: user.username,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: "15m",
        }
    );

    res.cookie(
        "accessToken",
        accessToken,
        {
            httpOnly: true,
            secure:
                process.env.NODE_ENV ===
                "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 15 * 60 * 1000,
        }
    );

    return await User.findById(
        user._id
    ).select(
        "-password -refreshToken"
    );
};

export default refreshAccessToken;