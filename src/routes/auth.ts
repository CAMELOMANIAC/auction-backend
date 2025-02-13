import { Router } from "express";
import registerAccount, { verifyEmail } from "../services/registerUser.service";
import { loginUser } from "../services/loginUser.service";
import { logout, refleshAccessToken as refreshAccessToken } from "../services/auth.service";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

//회원가입
router.post("/register", registerAccount);
router.delete("/verify-email/:code", verifyEmail);

//로그인
router.post("/login", loginUser);
//로그아웃
router.delete("/logout", authMiddleware, logout);

//액세스토큰 재발급
router.post("/refresh-token", refreshAccessToken);

export default router;
