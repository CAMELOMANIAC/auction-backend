import { Response } from "express";
import { UserAuthRequest } from "../middlewares/authMiddleware";
import { handlerError, requiredCheck } from "../utils/fuction";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";
import { insertAuction, insertImageUrl } from "../controllers/auction.controller";
import { fetchImageUpload } from "../utils/fetchImage";

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
      }
    }

    res.sendStatus(201);
  } catch (error) {
    handlerError(error, res);
  }
};
