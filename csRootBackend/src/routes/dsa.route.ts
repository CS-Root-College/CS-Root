import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware";
import { createDSAProblem, getAllDSAProblems, getDSAProblem } from "../controllers/dsa.controller";
import { getAllDsaSubmissions, getSubmissionDetails, getSubmissions, submitCode } from "../controllers/dsaSubmission.controller";

const router = Router();

router.post("/create-dsa-problem", verifyJWT, createDSAProblem);
router.get("/get-dsa-problem/:slug", verifyJWT, getDSAProblem);
router.get("/get-all-dsa-problems", getAllDSAProblems);

// Submissions route
router.post("/submit-dsa-problem/:problemId", verifyJWT, submitCode);
router.get("/submission/:submissionId", verifyJWT, getSubmissionDetails);
router.get("/:problemId/submissions", verifyJWT, getSubmissions);
router.get("/get-all-dsa-submissions", verifyJWT, getAllDsaSubmissions);


export default router;
