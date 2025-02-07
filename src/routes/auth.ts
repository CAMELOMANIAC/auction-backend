import { Router } from "express";
import registerUser, {
  checkRegisterEmail,
  checkRegisterId,
  checkRegisterNickname,
  verifyEmail,
} from "../services/registerUser.service";
import { loginUser } from "../services/loginUser.service";

const router = Router();

//회원가입
router.post("/auth/register", registerUser);
router.post("/auth/verify-email", verifyEmail);

//중복체크
router.get("/auth/id-duplication", checkRegisterId);
router.get("/auth/nickname-duplication", checkRegisterEmail);
router.get("/auth/email-duplication", checkRegisterNickname);

//로그인
router.post("/auth/login", loginUser);

export default router;
