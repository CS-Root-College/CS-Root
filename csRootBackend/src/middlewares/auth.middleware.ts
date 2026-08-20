import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import apiError from "../utils/apiError";
import refreshAccessToken from "../utils/refreshAccessToken";

export interface AuthenticatedRequest extends Request {
    user?: any;
}

const verifyJWT = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

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
    } catch {
        if (!refreshToken) {
            throw new apiError(401, "Unauthorized");
        }

        const user = await refreshAccessToken(
            refreshToken,
            res
        );

        req.user = user;

        return next();
    }
};

export default verifyJWT;