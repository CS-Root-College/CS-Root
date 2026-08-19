import type {Request, Response} from "express"
import apiError from "../utils/apiError";
import axios from "axios";
import crypto from "crypto";
import { User } from "../models/user.model";
import { sendTwoStepVerification } from "../service/twoStepVerification";
import apiResponse from "../utils/apiResponse";
import generateAccessAndRefreshTokens from "../utils/jwt";
import redis from "../config/redis";

const githubLogin = async (req: Request, res: Response) => {
    const state = crypto.randomUUID();

    await redis.set(
        `github_oauth_state:${state}`,
        "valid",
        "EX",
        300
    );

    const url =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${process.env.GITHUB_CLIENT_ID}` +
        `&state=${state}`;

    return res.redirect(url);
}

const githubCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string
    const state = req.query.state as string;
    
    if (!state) {
        throw new apiError(
            400,
            "OAuth state is missing"
        );
    }
    
    if(!code){
        throw new apiError(400,"Authorization code is missing")
    }

    const storedState = await redis.get(
        `github_oauth_state:${state}`
    );

    if (!storedState) {
        throw new apiError(
            400,
            "Invalid OAuth state"
        );
    }

    await redis.del(
        `github_oauth_state:${state}`
    );


    const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        },
        {
            headers: {
            Accept: "application/json"
            }
        }
    );

    const githubAccessToken = tokenResponse.data.access_token;

    if (!githubAccessToken) {
        throw new apiError(
            400,
            "Failed to get GitHub access token"
        );
    }

    const githubUserResponse = await axios.get(
        "https://api.github.com/user",
        {
            headers: {
            Authorization: `Bearer ${githubAccessToken}`
            }
        }
    );

    const githubUser = githubUserResponse.data;

    let user = await User.findOne({
        githubId: githubUser.id.toString()
    })

    if(!user){
        user = await User.create({
            name: githubUser.name || githubUser.login,
            username: `${githubUser.login.toLowerCase()}_${githubUser.id}`,
            githubUsername: githubUser.login.toLowerCase(),
            githubId: githubUser.id.toString(),
            profilePicture: githubUser.avatar_url,
            bio: githubUser.bio,
            authProvider: "github"
        })
    }
    
    if(user.twoStepVerification){
        await sendTwoStepVerification(user)

        return res.redirect(
        `${process.env.WEB_URL}/verify-two-step-verification?identifier=${encodeURIComponent(
            user.email ?? user.username
        )}`
    );
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(
            user._id
        )

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
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
    .redirect(`${process.env.WEB_URL}/problems`);
}

export {
    githubLogin,
    githubCallback
}