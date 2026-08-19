import { Router } from "express";
import { login, registerEmail, verifyEmail, verifyTwoStepVerification } from "../controllers/user.controller";

const router = Router()

router.post("/register-email",registerEmail)
router.post("/verify-email",verifyEmail)
router.post("/login",login)
router.post("/verify-two-step-verification",verifyTwoStepVerification)


export default router;