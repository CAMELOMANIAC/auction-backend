import { Router } from "express";
import { checkEmailDuplication, checkIdDuplication, checkNameDuplication } from "../services/checkUser.service";

const router = Router();

//사용자 정보 체크
router.get("/check-duplication/id", checkIdDuplication);
router.get("/check-duplication/nickname", checkNameDuplication);
router.get("/check-duplication/email", checkEmailDuplication);

export default router;
