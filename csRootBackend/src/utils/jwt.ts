import jwt from "jsonwebtoken";
import type { SignOptions } from 'jsonwebtoken'
import mongoose from "mongoose";
import {User} from "../models/user.model";
import redis from "../config/redis";
import apiError from "./apiError";
import bcrypt from "bcryptjs";

interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

const generateAccessAndRefreshTokens = async (
    userId: mongoose.Types.ObjectId
): Promise<TokenResponse> => {

    const user = await User.findById(userId);

    if (!user) {
        throw new apiError(404, "User not found");
    }

    const accessToken = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            username: user.username,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        } as SignOptions
    );

    const refreshToken = jwt.sign(
        {
            _id: user._id,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        } as SignOptions
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // MongoDB
    user.refreshToken = hashedRefreshToken;

    await user.save({
        validateBeforeSave: false,
    });

    // Redis
    await redis.set(
        `refreshToken:${user._id}`,
        refreshToken,
        "EX",
        60 * 60 * 24 * 14
    );

    return {
        accessToken,
        refreshToken,
    };
};

export default generateAccessAndRefreshTokens;