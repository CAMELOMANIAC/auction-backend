import pool from "../models/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";

/**
 * 사용자가 작성한 경매글의 auction_id를 반환
 *
 * @async
 * @param {string} id - 검색할 유저의 id
 * @returns {Promise<number[]>} - 사용자가 작성한 경매글의 auction_id 목록
 */
export const getUserAuctionIds = async (id: string): Promise<number[]> => {
  const [result] = await pool.execute<RowDataPacket[]>("SELECT auction_id FROM auction_table WHERE writer = ?", [id]);
  console.log("사용자가 작성한 경매글 검색 완료", result);
  return result.map((row) => row.auction_id);
};

/**
 * 사용자가 작성한 글의 bid_ind를 반환
 *
 * @async
 * @param {string} id - 검색할 유저의 id
 * @returns {Promise<number[]>} - 사용자가 작성한 글의 bid_ind
 */
export const getUserBidInds = async (id: string): Promise<number[]> => {
  const [result] = await pool.execute<RowDataPacket[]>("SELECT bid_ind FROM bid_table WHERE bidder = ?", [id]);
  console.log("사용자가 작성한 글 검색 완료", result);
  return result.map((row) => row.bid_ind);
};

/**
 * 경매 id로 경매글 제거
 *
 * @async
 * @throws
 * @param {number} auctionId - 삭제할 경매글 id
 */
export const deleteAuction = async (auctionId: number): Promise<void> => {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM auction_table WHERE auction_Id = ?", [auctionId]);
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("경매글 제거 완료", result);
};

/**
 * 사용자의 모든 경매글 제거
 *
 * @async
 * @throws
 * @param {string} id - 삭제할 사용자의 id
 * @returns {Promise<void>}
 */
export const deleteUserAuction = async (id: string): Promise<void> => {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM auction_table WHERE writer = ?", [id]);
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("사용자의 모든 경매글 제거 완료", result);
};

/**
 * 입찰id로 입찰 내역 제거
 *
 * @async
 * @throws
 * @param {number} bidInd - 삭제할 글의 bid_ind
 */
export const deleteBid = async (bidInd: number): Promise<void> => {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM bid_table WHERE bid_ind = ?", [bidInd]);
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("입찰내역 제거 완료", result);
};

/**
 * 사용자의 모든 입찰내역 제거
 *
 * @async
 * @throws
 * @param {string} id - 삭제할 사용자의 id
 */
export const deleteUserBid = async (id: string): Promise<void> => {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM bid_table WHERE bidder = ?", [id]);
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("사용자의 모든 입찰내역 제거 완료", result);
};

/**
 * 사용자의 모든 조회내역 제거
 *
 * @async
 * @throws
 * @param {string} id - 삭제할 사용자의 id
 */
export const deleteUserViewer = async (id: string): Promise<void> => {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM viewer_table WHERE user_id = ?", [id]);
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("사용자의 모든 조회내역 제거 완료", result);
};

/**
 * auction_id에 해당하는 이미지 제거
 *
 * @async
 * @throws
 * @param {number} auctionId - 이미지의 auction_id
 */
export const deleteImageByAuctionId = async (auctionId: number): Promise<void> => {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM image_table WHERE auction_id = ?", [auctionId]);
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log(auctionId, "이미지 제거 완료", result.insertId);
};

/**
 * 이미지 URL로 이미지 제거
 *
 * @async
 * @throws
 * @param {string} imageUrl - 삭제할 이미지의 URL
 */
export const deleteImageByImageUrl = async (imageUrl: string): Promise<void> => {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM image_table WHERE image_url = ?", [imageUrl]);
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log(imageUrl, "이미지 제거 완료", result);
};

type insertAuctionArg = {
  writer: string;
  itemName: string;
  itemDescription: string;
  expriesAt: Date;
  startPrice: number;
  bidStep: number;
};
/**
 * 경매글 삽입
 *
 * @async
 * @throws
 * @param {insertAuctionArg} arg - 경매글 생성에 필요한 정보
 */
export const insertAuction = async ({
  writer,
  itemName,
  itemDescription,
  expriesAt,
  startPrice,
  bidStep,
}: insertAuctionArg): Promise<number> => {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO auction_table (writer, item_name, item_description, created_at, expires_at, start_price, bid_step) VALUES (?,?,?,?,?,?,?)",
    [writer, itemName, itemDescription, new Date(), expriesAt, startPrice, bidStep]
  );
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("경매글 삽입 완료", result.insertId);
  return result.insertId;
};

/**
 * 경매글의 이미지를 삽입
 * 실제 이미지는 IMAGE_BB에 저장하고 그 url만 저장
 *
 * @async
 * @throws
 * @param {number} auctionId - 삽입할 이미지의 경매글 auction_id
 * @param {string} imageUrl - 삽입할 이미지의 URL
 * @param {string} deleteUrl - 이미지 제거시 요청할 URL
 */
export const insertImageUrl = async (auctionId: number, imageUrl: string, deleteUrl: string): Promise<void> => {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO image_table (image_url, auction_id, delete_url) VALUES (?,?,?)",
    [imageUrl, auctionId, deleteUrl]
  );
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("이미지 삽입 완료", result);
};

/**
 * 경매상품의 이미지를 삭제할 수 있는 url을 반환
 *
 * @async
 * @param {number} auctionId - 이미지의 경매글 auction_id
 * @returns {Promise<string[]>} - 경매상품 이미지 삭제 url 목록
 */
export const getImageDeleteUrl = async (auctionId: number): Promise<string[]> => {
  const [result] = await pool.execute<RowDataPacket[]>("SELECT delete_url FROM image_table WHERE auction_id = ?", [
    auctionId,
  ]);
  console.log("경매상품 이미지 삭제 url 검색 완료", result);
  return result.map((row) => row.delete_url);
};
