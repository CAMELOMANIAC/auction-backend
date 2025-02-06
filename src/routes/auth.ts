import { Router } from "express";
import registerUser, { verifyEmail } from "../services/registerUser.service";
import { loginUser } from "../services/LoginUser.service";

const router = Router();

router.get("/auth/register", registerUser);
router.get("/auth/verify-email", verifyEmail);
router.get("/auth/login", loginUser);

export default router;
