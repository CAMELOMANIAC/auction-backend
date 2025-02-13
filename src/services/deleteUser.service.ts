import { Response } from "express";
import { handlerError } from "../utils/fuction";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";
import { UserAuthRequest } from "../middlewares/authMiddleware";
import { deleteUserToken } from "../controllers/token.controller";
import { deleteUserId, deleteUserStatus } from "../controllers/user.controller";
import {
  deleteImageByAuctionId,
  deleteUserAuction,
  deleteUserBid,
  deleteUserViewer,
  getUserAuctionIds,
} from "../controllers/auction.controller";

/**
 * 회원 탈퇴
 * 1.token_table 행 제거(deleteUserToken)
 * 2.user_statuses_table 행 제거(deleteUserStatus)
 * 3.viewer_table 행 제거(deleteUserViewer)
 * 4.bid_table 행 제거(deleteUserBid)
 * 5.작성한 경매 글 검색(getUserAuctionIds)
 * 6.작성한 경매 글에 포함된 image_table 행 제거(deleteImageByAuctionId)
 * 7.auction_table 행 제거(deleteUserAuction)
 * 8.user_table 행 제거(deleteUserId)
 * 9.리프래시 토큰 제거 응답
 *
 * @param UserAuthRequest
 * @param res
 */
const deleteAccount = async (req: UserAuthRequest, res: Response) => {
  const id = req.user;

  //사용자 인증 토큰 제거
  try {
    if (!id) {
      throw new Error(errorCodeAnswer[ErrorCode.INVAILD_ACCESS_TOKEN].message);
    }
    try {
      await deleteUserToken(id);
    } catch (error) {
      if (error instanceof Error && error.message === errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message) {
        console.log("삭제할 토큰이 없습니다.");
      } else {
        throw error;
      }
    }

    // 사용자 상태 삭제
    try {
      await deleteUserStatus(id);
    } catch (error) {
      if (error instanceof Error && error.message === errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message) {
        console.log("삭제할 상태가 없습니다.");
      } else {
        throw error;
      }
    }

    // 사용자 뷰어 삭제
    try {
      await deleteUserViewer(id);
    } catch (error) {
      if (error instanceof Error && error.message === errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message) {
        console.log("삭제할 뷰어가 없습니다.");
      } else {
        throw error;
      }
    }

    // 사용자 입찰 삭제
    try {
      await deleteUserBid(id);
    } catch (error) {
      if (error instanceof Error && error.message === errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message) {
        console.log("삭제할 입찰이 없습니다.");
      } else {
        throw error;
      }
    }

    // 경매글 이미지 제거
    const auctionIdArray = await getUserAuctionIds(id);
    for (const auctionId of auctionIdArray) {
      try {
        await deleteImageByAuctionId(auctionId);
      } catch (error) {
        if (error instanceof Error && error.message === errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message) {
          console.log("삭제할 경매 사진이 없습니다.");
        } else {
          throw error;
        }
      }
    }

    // 경매 글 제거
    try {
      await deleteUserAuction(id);
    } catch (error) {
      if (error instanceof Error && error.message === errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message) {
        console.log("삭제할 경매글이 없습니다.");
      } else {
        throw error;
      }
    }

    // 유저 제거
    try {
      await deleteUserId(id);
    } catch (error) {
      if (error instanceof Error && error.message === errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message) {
        throw new Error(errorCodeAnswer[ErrorCode.FAILD_TO_DELETE_USER].message);
      }
    }
    //리프래시 토큰 제거 응답
    res.cookie("refreshToken", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
      path: "/",
    });
    res.sendStatus(204);
  } catch (error) {
    handlerError(error, res);
  }
};

export default deleteAccount;
