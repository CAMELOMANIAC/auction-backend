import { Router } from "express";
import registerUser, { verifyEmail } from "../services/registerUser.service";
import { loginUser } from "../services/loginUser.service";
import { refleshAccessToken } from "../services/auth.service";

const router = Router();

//회원가입
router.post("/register", registerUser);
router.delete("/verify-email/:code", verifyEmail);

//로그인
router.post("/login", loginUser);

//액세스토큰 재발급
router.post("/refresh", refleshAccessToken);

export default router;
