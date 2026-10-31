import { Router } from "express";
import { changeProfilePicture, getCurrentUser, login, logout, registerEmail, verifyEmail, verifyTwoStepVerification } from "../controllers/user.controller";
import verifyJWT from "../middlewares/auth.middleware";
import upload from "../middlewares/multer.middleware";
import { loginLimiter, meLimiter, profilePictureLimiter, registerLimiter, twoStepLimiter, verifyEmailLimiter } from "../middlewares/rateLimiter.middleware";

const router = Router()

router.post("/register-email", registerLimiter, registerEmail)
router.post("/verify-email", verifyEmailLimiter, verifyEmail)
router.post("/login", loginLimiter, login)
router.post("/verify-two-step-verification", twoStepLimiter, verifyTwoStepVerification)
router.get("/me",verifyJWT, meLimiter, getCurrentUser)
router.post("/logout",verifyJWT,logout)

router.patch("/update-profile-picture",verifyJWT, profilePictureLimiter, upload.single("profilePicture"),changeProfilePicture);


export default router;