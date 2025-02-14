import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { registerAuction } from "../services/auction.service";
import upload from "../middlewares/binaryParserMiddleware";
const router = Router();

const binaryParser = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "subImage", maxCount: 3 },
]);
router.post("/", authMiddleware, binaryParser, registerAuction);

export default router;
