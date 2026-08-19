import { Router } from "express";
import { githubCallback, githubLogin } from "../controllers/github.controller";

const router = Router()

router.get("/github-login",githubLogin)
router.get("/github-callback",githubCallback)

export default router;