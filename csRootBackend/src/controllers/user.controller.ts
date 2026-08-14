import type { Request, Response } from "express";
import apiError from "../utils/apiError";
import apiResponse from "../utils/apiResponse";
import { User } from "../models/user.model";
import { verifyEmailLayout } from "../emailLayouts/emailVerification";
import sendEmail from "../service/sendEmail.js";
import crypto from "crypto";

const registerEmail = async (req: Request, res: Response) => {
    const {email, username} = req.body

    const otp = crypto.randomInt(100000, 1000000).toString();

    await sendEmail({
        email,
        subject: "Verify your CS Root account",
        layout: verifyEmailLayout(username,otp)
    })

    return res.status(200).json(
        new apiResponse(200,"Email sent successfully")
    )
}

export {
    registerEmail
}