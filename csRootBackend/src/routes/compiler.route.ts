import { Router } from "express";
import { executeCompiler } from "../controllers/compiler.controller";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

router.post("/execute", verifyJWT, executeCompiler);

export default router;
