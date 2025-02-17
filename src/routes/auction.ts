import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {
  getAuctionDetail,
  getAuctionImage,
  getAuctionList,
  getBidList,
  getViewerCount,
  regiserBid,
  registerAuction,
} from "../services/auction.service";
import upload from "../middlewares/binaryParserMiddleware";
const router = Router();

const binaryParser = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "subImage", maxCount: 3 },
]);
router.post("/", authMiddleware, binaryParser, registerAuction);
router.get("/", getAuctionList);

router.get("/:auctionId/detail", getAuctionDetail);
router.get("/:auctionId/image", getAuctionImage);
router.get("/:auctionId/bid", getBidList);
router.post("/:auctionId/bid", authMiddleware, regiserBid);
router.get("/:auctionId/viewer-count", getViewerCount);

export default router;
