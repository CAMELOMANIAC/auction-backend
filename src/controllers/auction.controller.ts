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
  const [row] = await pool.execute<RowDataPacket[]>("SELECT auction_id FROM auction_table WHERE writer = ?", [id]);
  console.log("사용자가 작성한 경매글 검색 완료", row);
  return row.map((row) => row.auction_id);
};

/**
 * 사용자가 작성한 글의 bid_ind를 반환
 *
 * @async
 * @param {string} id - 검색할 유저의 id
 * @returns {Promise<number[]>} - 사용자가 작성한 글의 bid_ind
 */
export const getUserBidInds = async (id: string): Promise<number[]> => {
  const [row] = await pool.execute<RowDataPacket[]>("SELECT bid_ind FROM bid_table WHERE bidder = ?", [id]);
  console.log("사용자가 작성한 글 검색 완료", row);
  return row.map((row) => row.bid_ind);
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
  const [row] = await pool.execute<RowDataPacket[]>("SELECT delete_url FROM image_table WHERE auction_id = ?", [
    auctionId,
  ]);
  console.log("경매상품 이미지 삭제 url 검색 완료", row);
  return row.map((row) => row.delete_url);
};

/**
 * 경매글 목록을 검색
 *
 * @async
 * @throws
 * @param {number} [pageCursor=0] - 페이지 커서 (0부터 시작)
 * @param {string} [orderBy="created_at"] 정렬할 컬럼
 * @param {"ASC" | "DESC"} [order="DESC"] - 정렬순서
 * @param {number} [limit=10] - 한 페이지당 보여질 행의 수
 * @returns {Promise<number[]>} - 경매글의 auction_id 목록
 */
export const selectAuctionList = async (
  pageCursor: number = 0,
  orderBy: string | undefined = "created_at",
  order: string | undefined = "DESC",
  limit: number | undefined = 10,
  query?: string
): Promise<RowDataPacket[]> => {
  const allowedColumns = ["created_at", "expires_at", "viewer_count", "bid_count", undefined];
  if (!allowedColumns.includes(orderBy)) {
    throw new Error(errorCodeAnswer[ErrorCode.NOT_ALLOWED_ORDER_BY].message);
  }
  order = order === "ASC" ? "ASC" : "DESC";

  let whereClause = "a.auction_id > ?";
  const queryParams: Array<string | number> = [pageCursor];

  if (query) {
    whereClause += " AND a.item_name LIKE ?";
    queryParams.push(`%${query}%`);
  }

  const sqlQuery = `
  SELECT 
      a.auction_id,
      a.item_name,
      a.item_description,
      a.expires_at,
      COALESCE(v.viewer_count, 0) AS viewer_count,
      COALESCE(b.bid_count, 0) AS bid_count,
      COALESCE(b.price, 0) AS price,
      i.image_url AS main_image_url
  FROM 
      auction_table a
  LEFT JOIN 
      (SELECT auction_id, COUNT(*) AS viewer_count 
       FROM viewer_table 
       GROUP BY auction_id) v ON a.auction_id = v.auction_id
  LEFT JOIN 
      (SELECT auction_id, COUNT(DISTINCT bidder) AS bid_count, MAX(price) AS price 
       FROM bid_table 
       GROUP BY auction_id) b ON a.auction_id = b.auction_id
  LEFT JOIN 
      image_table i ON a.auction_id = i.auction_id
  WHERE 
      ${whereClause}
  ORDER BY 
      ${orderBy} ${order}
  LIMIT ${limit}
  `;

  const [rows] = await pool.execute<RowDataPacket[]>(sqlQuery, queryParams);
  console.log("경매글 목록 검색 완료", rows);
  return rows;
};

type Auction = {
  auctionId: number;
  writer: string;
  itemName: string;
  itemDescription: string;
  createdAt: Date;
  expiresAt: Date;
  startPrice: number;
  bidStep: number;
};
/**
 * 경매글 상세 정보를 검색
 *
 * @async
 * @param {number} auctionId - 경매글 id
 * @returns {Promise<Auction>} - 경매글 상세 정보
 */
export const selectAuctionDetail = async (auctionId: number): Promise<Auction> => {
  const [row] = await pool.execute<RowDataPacket[]>(
    "SELECT auction_id, writer, item_name, item_description, created_at, expires_at, start_price, bid_step FROM auction_table WHERE auction_id = ?",
    [auctionId]
  );
  console.log("경매글 상세 정보 검색 완료", row);
  return row.map((row) => ({
    auctionId: row.auction_id,
    writer: row.writer,
    itemName: row.item_name,
    itemDescription: row.item_description,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    startPrice: row.start_price,
    bidStep: row.bid_step,
  }))[0];
};

/**
 * 경매상품 이미지를 검색
 *
 * @async
 * @param {number} auctionId - 경매상품의 auction_id
 * @returns {Promise<RowDataPacket[]>} - 경매상품 이미지 url 목록
 */
export const selectAuctionImage = async (auctionId: number): Promise<RowDataPacket[]> => {
  const [row] = await pool.execute<RowDataPacket[]>("SELECT image_url FROM image_table WHERE auction_id = ?", [
    auctionId,
  ]);
  console.log("경매상품 이미지 검색 완료", row);
  return row.map((row) => row.image_url);
};

/**
 * 경매상품의 모든 입찰 내역을 검색
 *
 * @async
 * @param {number} auctionId - 경매상품의 auction_id
 * @returns {Promise<RowDataPacket[]>} - 경매상품의 모든 입찰 내역
 */
export const selectBid = async (auctionId: number): Promise<RowDataPacket[]> => {
  const [row] = await pool.execute<RowDataPacket[]>(
    "SELECT bidder, price, created_at FROM bid_table WHERE auction_id = ?",
    [auctionId]
  );
  console.log("경매상품 글 검색 완료", row);
  return row;
};

/**
 * 경매상품에 새로운 입찰을 추가
 *
 * @async
 * @throws
 * @param {number} auctionId - 경매상품의 auction_id
 * @param {string} bidder - 새로운 입찰자의 id
 * @param {number} price - 새로운 입찰의 가격
 */
export const insertBid = async (auctionId: number, bidder: string, price: number): Promise<void> => {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO bid_table (auction_id, bidder, price, created_at) VALUES (?,?,?,NOW())",
    [auctionId, bidder, price]
  );
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("경매상품 글 삽입 완료", result);
};

/**
 * 경매상품의 조회수 검색
 *
 * @async
 * @param {number} auctionId - 경매상품의 auction_id
 * @returns {Promise<number>} - 경매상품의 조회수
 */
export const selectViewerCount = async (auctionId: number): Promise<number> => {
  const [row] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS viewer_count FROM viewer_table WHERE auction_id = ?",
    [auctionId]
  );
  console.log("경매상품 글 검색 완료", row);
  return row[0].viewer_count;
};
