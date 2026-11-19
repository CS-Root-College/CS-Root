import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import redis from "../config/redis";
import apiError from "../utils/apiError";
import refreshAccessToken from "../utils/refreshAccessToken";

export interface AuthenticatedRequest extends Request {
    user?: any;
    file?: any;
}

const verifyJWT = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const platform = req.headers.authorization?.startsWith("Bearer ")
        ? "app"
        : "website";

    const accessToken =
        req.cookies?.accessToken ||
        (platform === "app"
            ? req.headers.authorization?.split(" ")[1]
            : undefined);

    try {
        if (!accessToken) {
            throw new Error();
        }

        const decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET!
        ) as {
            _id: string;
        };

        const user = await User.findById(decoded._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new apiError(401, "Invalid access token");
        }

        req.user = user;

        return next();
    } catch (error) {
        if (!(error instanceof jwt.TokenExpiredError)) {
            throw error instanceof apiError
                ? error
                : new apiError(401, "Unauthorized");
        }

        let refreshToken = req.cookies?.refreshToken;

        if (platform === "app" && accessToken) {
            const decoded = jwt.decode(accessToken) as {
                _id: string;
            } | null;

            if (!decoded?._id) {
                throw new apiError(401, "Invalid access token");
            }

            refreshToken = await redis.get(
                `refreshToken:${decoded._id}`
            ) || undefined;
        }

        if (!refreshToken) {
            throw new apiError(401, "Unauthorized");
        }

        const user = await refreshAccessToken(
            refreshToken,
            res,
            platform
        );

        req.user = user;

        return next();
    }
};

export default verifyJWT;