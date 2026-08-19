import crypto from "crypto";
import redis from "../config/redis";
import type { IUser } from "../models/user.model";
import sendEmail from "./sendEmail";
import { verifyTwoFactorLayout } from "../emailLayouts/twoStepVerification";
import apiError from "../utils/apiError";

export const sendTwoStepVerification =
    async (
        user: IUser
    ): Promise<void> => {

        const ttl = await redis.ttl(
            `twoStepVerification:code:${user.email}`
        )

        if (ttl > 0) {

            const minutes = Math.max(
                1,
                Math.ceil(ttl / 60)
            )

            throw new apiError(
                400,
                `A verification code has already been sent. Please wait ${minutes} minute(s) before requesting another code.`
            )
        }

        const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        let code = "";

        for (let i = 0; i < 5; i++) {
            code += characters[
                crypto.randomInt(characters.length)
            ];
        }

        await redis.set(
            `twoStepVerification:code:${user.email}`,
            code,
            "EX",
            300
        )

        await sendEmail({
            email: user.email || "",
            subject:
                "Your CS Root Security Code",
            layout:
                verifyTwoFactorLayout(
                    user.username,
                    code
                ),
        })
    }