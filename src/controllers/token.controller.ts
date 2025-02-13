import { QueryResult, ResultSetHeader, RowDataPacket } from "mysql2";
import tokenType from "../utils/tokenType";
import pool from "../models/db";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";

/**
 * 토큰 삽입
 *
 * @async
 * @throw
 * @param {string} id - 삽입할 유저의 id
 * @param {tokenType} tokenType - 삽입할 토큰의 타입
 * @param {string} tokenValue - 삽입할 토큰의 값
 * @param {Date} expiresAt - 토큰 만료시간
 * @returns {Promise<QueryResult>}
 */
export const insertToken = async (
  id: string,
  tokenType: tokenType,
  tokenValue: string,
  expiresAt: Date
): Promise<QueryResult> => {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO token_table (user_id, token_type, token_value, expires_at) VALUES (?,?,?,?)",
    [id, tokenType, tokenValue, expiresAt]
  );
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("토큰 생성 완료", result);
  return result;
};

/**
 * 토큰 삭제
 *
 * @async
 * @throw
 * @param {string} id - 삭제할 유저의 id
 * @param {tokenType} tokenType - 삭제할 토큰의 타입
 * @param {string} tokenValue - 삭제할 토큰의 값
 * @returns {Promise<QueryResult>} - 삭제 성공시 void, 실패시 에러
 */
export const deleteToken = async (id: string, tokenType: tokenType, tokenValue: string): Promise<QueryResult> => {
  const [result] = await pool.execute<ResultSetHeader>(
    "DELETE FROM token_table WHERE user_id = ? AND token_type = ? AND token_value = ?",
    [id, tokenType, tokenValue]
  );
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("토큰 삭제 완료", result);
  return result;
};

/**
 * 회원의 모든 토큰 삭제
 *
 * @async
 * @throw
 * @param {string} id - 토큰을 삭제할 사용자 id
 */
export const deleteUserToken = async (id: string): Promise<void> => {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM token_table WHERE user_id = ?", [id]);
  if (result.affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("사용자의 모든 토큰 삭제 완료", result);
};

/**
 * 이메일 인증 토큰 검사
 *
 * @async
 * @throw
 * @param {string} randomCode - 이메일 인증 랜덤 번호
 * @returns {Promise<string>} 검색에 성공시 사용자 user_id를 반환
 */
export const checkEmailToken = async (randomCode: string): Promise<string> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT user_id FROM token_table WHERE token_type = ? AND token_value = ? AND expires_at > NOW()",
    [tokenType.EMAIL_VERIFICATION_TOKEN, randomCode]
  );
  if (rows.length === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.EMAIL_VERIFICATION_NOT_FOUND].message);
  }
  console.log("이메일 체크 성공", rows);
  return rows[0].user_id;
};

/**
 * 리프레시 토큰 검사
 *
 * @async
 * @throw
 * @param {string} userId - 검사할 유저의 id
 */
export const checkRefleshToken = async (userId: string): Promise<void> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT user_id FROM token_table WHERE user_id = ? AND token_type = ? AND expires_at > NOW()",
    [userId, tokenType.REFRESH_TOKEN]
  );
  if (rows.length === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.INVAILD_REFRESH_TOKEN].message);
  }
  console.log("리프레시 토큰 체크 성공", rows);
};

/**
 * 토큰의 실제 값을 반환
 *
 * @async
 * @throw
 * @param {string} userId - 토큰을 반환할 유저의 id
 * @param {tokenType} tokenType - 토큰의 타입
 * @returns {Promise<string>} - 토큰의 실제 값, 실패시 에러
 */
export const getTokenValue = async (userId: string, tokenType: tokenType): Promise<string> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT token_value FROM token_table WHERE user_id = ? AND token_type = ? AND expires_at > NOW()",
    [userId, tokenType]
  );
  if (rows.length === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.INVAILD_REFRESH_TOKEN].message);
  }
  return rows.map((row) => row.token_value)[0];
};

/**
 * 만료된 액세스 토큰을 삭제
 * cron job용 함수
 *
 * @async
 */
export const deleteExpiredTokens = async () => {
  try {
    const [result] = await pool.execute<ResultSetHeader>("DELETE FROM token_table WHERE expires_at <= NOW()");
    console.log("만료된 토큰을 제거했습니다:", result);
  } catch (err) {
    console.error("토큰을 제거하는 도중 오류가 발생했습니다:", err);
  }
};
