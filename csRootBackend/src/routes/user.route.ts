import { Router } from "express";
import { registerEmail, verifyEmail } from "../controllers/user.controller";

const router = Router()

router.post("/register-email",registerEmail)
router.post("/verify-email",verifyEmail)


export default router;