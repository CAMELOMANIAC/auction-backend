import { Request, Response, Router } from "express";
import userRouter from "./user";
import authRouter from "./auth";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: `백엔드 서버가 실행 중입니다. get`, query: req.query });
});
router.post("/", (req: Request, res: Response) => {
  res.json({ message: `백엔드 서버가 실행 중입니다. post`, body: req.body });
});

router.use("/user", userRouter);

router.use("/auth", authRouter);

export default router;
