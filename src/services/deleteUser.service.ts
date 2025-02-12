import { Response } from "express";
import { handlerError } from "../utils/fuction";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";
import { UserAuthRequest } from "../middlewares/authMiddleware";
import { deleteUserToken } from "../controllers/token.controller";
import { deleteUserId, deleteUserStatus } from "../controllers/user.controller";
import {
  deleteImageByActionId,
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
 * 6.작성한 경매 글에 포함된 image_table 행 제거(deleteImageByActionId)
 * 7.auction_table 행 제거(deleteUserAuction)
 * 8.user_table 행 제거(deleteUserId)
 *
 * @param UserAuthRequest
 * @param res
 */
const deleteUser = async (req: UserAuthRequest, res: Response) => {
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
    const actionIdArray = await getUserAuctionIds(id);
    for (const actionId of actionIdArray) {
      try {
        await deleteImageByActionId(actionId);
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
    res.sendStatus(204);
  } catch (error) {
    handlerError(error, res);
  }
};

export default deleteUser;
