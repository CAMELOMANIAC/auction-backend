import { Router } from "express";
import registerUser from "../services/registerUser.service";
const router = Router();
router.get("/auth/register", registerUser);

export default router;
