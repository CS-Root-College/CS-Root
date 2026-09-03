import { Router } from "express";
import { changeProfilePicture, getCurrentUser, login, logout, registerEmail, verifyEmail, verifyTwoStepVerification } from "../controllers/user.controller";
import verifyJWT from "../middlewares/auth.middleware";
import upload from "../middlewares/multer.middleware";

const router = Router()

router.post("/register-email",registerEmail)
router.post("/verify-email",verifyEmail)
router.post("/login",login)
router.post("/verify-two-step-verification",verifyTwoStepVerification)
router.get("/me",verifyJWT,getCurrentUser)
router.post("/logout",verifyJWT,logout)

router.patch("/update-profile-picture",verifyJWT, upload.single("profilePicture"),changeProfilePicture);


export default router;