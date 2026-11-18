
import { Router } from "express";

import { getDashboardOverview } from "../controllers/dashboard.controller";
import verifyJWT from "../middlewares/auth.middleware";

const router = Router();

// Get logged-in student's dashboard overview
router.get("/overview", verifyJWT, getDashboardOverview);

export default router;
