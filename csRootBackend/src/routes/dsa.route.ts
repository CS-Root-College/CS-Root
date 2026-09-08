import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { createDSAProblem, getAllDSAProblems, getDSAProblem } from "../controllers/dsa.controller";

const router = Router();

router.post("/create-dsa-problem", verifyJWT, createDSAProblem);
router.get("/get-dsa-problem/:slug", verifyJWT, getDSAProblem);
router.get("/get-all-dsa-problems", getAllDSAProblems);

export default router;
