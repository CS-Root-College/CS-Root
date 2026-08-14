import { Router } from "express";
import { registerEmail } from "../controllers/user.controller";

const router = Router()

router.post("/send-email",registerEmail)

export default router;