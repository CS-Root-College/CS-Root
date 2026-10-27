import { Router } from "express";
<<<<<<< Updated upstream
import { getCurrentUser, login, logout, registerEmail, verifyEmail, verifyTwoStepVerification } from "../controllers/user.controller";
=======
import { changeProfilePicture, getCurrentUser, login, logout, registerEmail, verifyEmail, verifyTwoStepVerification,forgotPassword,verifyResetOTP,resetPassword } from "../controllers/user.controller";
>>>>>>> Stashed changes
import verifyJWT from "../middlewares/auth.middleware";

const router = Router()

router.post("/register-email",registerEmail)
router.post("/verify-email",verifyEmail)
router.post("/login",login)
router.post("/verify-two-step-verification",verifyTwoStepVerification)
router.get("/me",verifyJWT,getCurrentUser)
router.post("/logout",verifyJWT,logout)

<<<<<<< Updated upstream
=======

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);


router.patch("/update-profile-picture",verifyJWT, upload.single("profilePicture"),changeProfilePicture);

>>>>>>> Stashed changes

export default router;