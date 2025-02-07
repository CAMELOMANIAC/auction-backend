import { Router } from "express";
import registerUser, { verifyEmail } from "../services/registerUser.service";
import { loginUser } from "../services/loginUser.service";

const router = Router();

//회원가입
router.post("/register", registerUser);
router.delete("/verify-email", verifyEmail);

//로그인
router.post("/login", loginUser);

export default router;
