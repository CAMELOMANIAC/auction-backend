import { Request, Response } from "express";
import { UserAuthRequest } from "../middlewares/authMiddleware";
import { deleteFile, handlerError, requiredCheck } from "../utils/fuction";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";
import {
  insertAuction,
  insertBid,
  insertImageUrl,
  insertViewer,
  selectAuctionDetail,
  selectAuctionImage,
  selectAuctionList,
  selectBid,
  selectViewerCount,
} from "../controllers/auction.controller";
import { fetchImageUpload } from "../utils/fetchImage";
import path from "path";
import pool from "../models/db";

type fileRequest = {
  mainImage?: Express.Multer.File[];
  subImage?: Express.Multer.File[];
};
type registerAuctionReq = UserAuthRequest & { files?: fileRequest };

/**
 * 액세스토큰을 이용한 경매글 작성
 * 1.경매글 작성(insertAuction)
 * 2.이미지를 이미지 bb에 업로드(fetchImageUpload)
 * 3.db에 업로드된 이미지의 경로를 저장(insertImageUrl)
 * 4.업로드가 완료된 이미지를 백엔드 서버에서 삭제(deleteFile)
 *
 * @param {registerAuctionReq} req - 인증된 사용자 id와 이미지 파일이 포함된 커스텀 Request객체
 * @param {Response} res - 일반적인 Response객체
 */
export const registerAuction = async (req: registerAuctionReq, res: Response) => {
  const userId = req.user;
  const body = req.body;

  const mainImage = req.files?.mainImage ? req.files.mainImage[0] : null;
  const subImages = req.files?.subImage || [];

  // 쿼리 파라미터 유효성 검사(form-data타입이라서 number도 string으로 변환되어있음)
  const requiredFields = [
    {
      name: "itemName",
      type: "string",
      minLength: 1,
      maxLength: 20,
    },
    {
      name: "itemDescription",
      type: "string",
      minLength: 0,
      maxLength: 200,
    },
    {
      name: "expriesAt",
      type: "string",
      minLength: 1,
      maxLength: 45,
    },
    {
      name: "startPrice",
      type: "string",
      minLength: 0,
      maxLength: 9,
    },
    {
      name: "bidStep",
      type: "string",
      minLength: 0,
      maxLength: 9,
    },
  ];
  const requiredCheckResult = requiredCheck(requiredFields, body);
  if (requiredCheckResult !== null) {
    res.status(400).json({ error: requiredCheckResult.error });
    return;
  }
  const { itemName, itemDescription, expriesAt, startPrice, bidStep } = body;
  try {
    if (!userId) {
      throw new Error(errorCodeAnswer[ErrorCode.INVAILD_ACCESS_TOKEN].message);
    }
    if (!mainImage) {
      throw new Error(errorCodeAnswer[ErrorCode.INVAILD_ACCESS_TOKEN].message);
    }

    const auctionId = await insertAuction({
      writer: userId,
      itemName,
      itemDescription,
      expriesAt: new Date(expriesAt),
      startPrice: Number(startPrice),
      bidStep: Number(bidStep),
    });

    const mainImageResData = await fetchImageUpload(mainImage);
    if (!mainImageResData) {
      throw new Error(errorCodeAnswer[ErrorCode.IMAGE_NOT_UPLOADED].message);
    }
    await insertImageUrl(auctionId, mainImageResData.url, mainImageResData.deleteUrl);

    const fileToDelete = path.join(__dirname, "uploads", mainImage.filename);
    deleteFile(fileToDelete);

    //병렬 수행
    // await Promise.all(
    //   subImages.map(async (image) => {
    //     const subImageResData = await fetchImageUpload(image);
    //     if (subImageResData) {
    //       await insertImageUrl(auctionId, subImageResData.url, subImageResData.deleteUrl);
    //     }
    //   })
    // );
    //순차 수행
    for (const image of subImages) {
      const subImageResData = await fetchImageUpload(image);
      if (subImageResData) {
        await insertImageUrl(auctionId, subImageResData.url, subImageResData.deleteUrl);
        const fileToDelete = path.join(__dirname, "uploads", image.filename);
        deleteFile(fileToDelete);
      }
    }

    res.sendStatus(201);
  } catch (error) {
    handlerError(error, res);
  }
};

/**
 * 경매글 목록을 검색
 * @param {Request} req - 일반적인 Request객체
 * @param {Response} res - 일반적인 Response객체
 */
export const getAuctionList = async (req: Request, res: Response) => {
  const { pageCursor, orderBy, order, limit, query } = req.query;
  try {
    const auctionList = await selectAuctionList(
      typeof pageCursor === "string" ? Number(pageCursor) : undefined,
      typeof orderBy === "string" ? orderBy : undefined,
      typeof order === "string" ? order : undefined,
      typeof limit === "string" ? Number(limit) : undefined,
      typeof query === "string" ? query : undefined
    );
    res.json(auctionList);
  } catch (error) {
    handlerError(error, res);
  }
};

/**
 * 경매글 상세 정보를 검색
 * @param {Request} req - 일반적인 Request객체
 * @param {Response} res - 일반적인 Response객체
 */
export const getAuctionDetail = async (req: Request, res: Response) => {
  const auctionId = req.params.auctionId ? Number(req.params.auctionId) : undefined;

  try {
    if (!auctionId) {
      throw new Error(errorCodeAnswer[ErrorCode.AUCTION_ID_REQUIRED].message);
    }
    const auctionDetail = await selectAuctionDetail(auctionId);
    res.json(auctionDetail);
  } catch (error) {
    handlerError(error, res);
  }
};

/**
 * 경매글의 이미지를 검색
 * @param {Request} req - 일반적인 Request객체
 * @param {Response} res - 일반적인 Response객체
 */
export const getAuctionImage = async (req: Request, res: Response) => {
  const auctionId = req.params.auctionId ? Number(req.params.auctionId) : undefined;
  try {
    if (!auctionId) {
      throw new Error(errorCodeAnswer[ErrorCode.AUCTION_ID_REQUIRED].message);
    }
    const imageUrl = await selectAuctionImage(auctionId);
    res.json(imageUrl);
  } catch (error) {
    handlerError(error, res);
  }
};

/**
 * 경매글의 입찰 내역을 검색
 * @param {Request} req - 일반적인 Request객체
 * @param {Response} res - 일반적인 Response객체
 */
export const getBidList = async (req: Request, res: Response) => {
  const auctionId = req.params.auctionId ? Number(req.params.auctionId) : undefined;
  try {
    if (!auctionId) {
      throw new Error(errorCodeAnswer[ErrorCode.AUCTION_ID_REQUIRED].message);
    }
    const bid = await selectBid(auctionId);
    res.json(bid);
  } catch (error) {
    handlerError(error, res);
  }
};

/**
 * 경매에 새로운 입찰을 추가
 * 1. DB에서 경매 마감일, 최소입찰액을 검색(selectAuctionDetail)
 * 2. DB에서 현재 최고입찰액 검색(selectBid)
 * 3. DB에 입찰을 추가(insertBid)
 *
 * @param {registerAuctionReq} req - 경매 id, 입찰 정보가 포함된 Request객체
 * @param {Response} res - 일반적인 Response객체
 * @throws {Error} - 경매 id가 없는 경우, invalid access token인 경우, 경매가 끝난 경우, 더 높은 입찰이 있는 경우
 */
export const registerBid = async (req: registerAuctionReq, res: Response) => {
  const auctionId = req.params.auctionId ? Number(req.params.auctionId) : undefined;
  const userId = req.user;
  const connection = await pool.getConnection();

  try {
    if (!userId) {
      throw new Error(errorCodeAnswer[ErrorCode.INVAILD_ACCESS_TOKEN].message);
    }
    if (!auctionId) {
      throw new Error(errorCodeAnswer[ErrorCode.AUCTION_ID_REQUIRED].message);
    }
    const { price } = req.body;
    if (!price) {
      throw new Error(errorCodeAnswer[ErrorCode.BID_PRICE_REQUIRED].message);
    }
    await connection.beginTransaction();
    // 트랜잭션 내에서 쿼리 실행
    const auctionDetail = await selectAuctionDetail(auctionId);

    if (price < auctionDetail.startPrice) {
      throw new Error(errorCodeAnswer[ErrorCode.BID_BELOW_STARTING_PRICE].message);
    }
    if (new Date() > auctionDetail.expiresAt) {
      throw new Error(errorCodeAnswer[ErrorCode.AUCTION_DATE_EXPIRED].message);
    }
    const bid = await selectBid(auctionId);
    const isOverBid = bid.some((bidItem) => bidItem.price > price);
    if (isOverBid) {
      throw new Error(errorCodeAnswer[ErrorCode.HIGHER_BID_EXIST].message);
    }
    await insertBid(auctionId, userId, price);

    await connection.commit();
    res.sendStatus(201);
  } catch (error) {
    await connection.rollback();
    handlerError(error, res);
  } finally {
    connection.release();
  }
};

/**
 * 경매글의 조회수를 반환
 * @param {Request} req - 경매글 id가 포함된 Request객체
 * @param {Response} res - 조회수 정보를 반환할 Response객체
 */
export const getViewerCount = async (req: Request, res: Response) => {
  const auctionId = req.params.auctionId ? Number(req.params.auctionId) : undefined;
  try {
    if (!auctionId) {
      throw new Error(errorCodeAnswer[ErrorCode.AUCTION_ID_REQUIRED].message);
    }
    const viewerCount = await selectViewerCount(auctionId);
    res.json({ viewerCount });
  } catch (error) {
    handlerError(error, res);
  }
};

/**
 * 경매글에 조회자를 등록
 *
 * @async
 * @param {registerAuctionReq} req - 경매글 id와 사용자 id가 포함된 인증된 Request객체
 * @param {Response} res - 상태 코드를 반환할 Response객체
 * @throws 에러 발생 시 에러를 처리하고 응답
 */
export const registerViewer = async (req: registerAuctionReq, res: Response) => {
  const auctionId = req.params.auctionId ? Number(req.params.auctionId) : undefined;
  const userId = req.user;
  try {
    if (!userId) {
      throw new Error(errorCodeAnswer[ErrorCode.INVAILD_ACCESS_TOKEN].message);
    }
    if (!auctionId) {
      throw new Error(errorCodeAnswer[ErrorCode.AUCTION_ID_REQUIRED].message);
    }
    await insertViewer(auctionId, userId);
    res.sendStatus(201);
  } catch (error) {
    handlerError(error, res);
  }
};
