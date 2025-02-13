import { Router } from "express";
import { checkEmailDuplication, checkIdDuplication, checkNameDuplication } from "../services/checkUser.service";
import deleteUser from "../services/deleteUser.service";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

//사용자 정보 체크
router.get("/check-duplication/id", checkIdDuplication);
router.get("/check-duplication/nickname", checkNameDuplication);
router.get("/check-duplication/email", checkEmailDuplication);

router.delete("/", authMiddleware, deleteUser);

export default router;
