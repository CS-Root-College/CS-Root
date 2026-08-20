import { Router } from "express";
import { getCurrentUser, login, logout, registerEmail, verifyEmail, verifyTwoStepVerification } from "../controllers/user.controller";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router()

router.post("/register-email",registerEmail)
router.post("/verify-email",verifyEmail)
router.post("/login",login)
router.post("/verify-two-step-verification",verifyTwoStepVerification)
router.get("/me",verifyJWT,getCurrentUser)
router.post("/logout",verifyJWT,logout)


export default router;