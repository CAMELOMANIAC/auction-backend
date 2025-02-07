import { Request, Response } from "express";
import pool from "../models/db";
import { QueryResult, ResultSetHeader, RowDataPacket } from "mysql2";
import userStatus from "../utils/userStatusType";
import tokenType from "../utils/tokenType";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";

export const getUsers = async (req: Request, res: Response) => {
  const userId = req.query.user_id;

  // 쿼리 파라미터 유효성 검사
  if (!userId) {
    res.status(400).json({ error: "user_id 쿼리 파라미터가 필요합니다." });
    return;
  }

  try {
    const [rows] = await pool.execute("SELECT * FROM user_login_table WHERE user_id = ?", [userId]);
    res.json(rows);
  } catch (err) {
    console.error("데이터베이스 쿼리 중 에러가 발생했습니다:", err);
    res.status(500).json({ error: "데이터베이스 쿼리 중 에러가 발생했습니다." });
  }
};

/**
 * 회원정보 삽입
 *
 * @async
 * @throws
 * @param {string} id
 * @param {string} password
 * @param {string} email
 * @param {string} nickname
 * @returns {Promise<QueryResult>}
 */
export const insertUser = async (
  id: string,
  password: string,
  email: string,
  nickname: string
): Promise<QueryResult> => {
  const [result] = await pool.execute<ResultSetHeader[]>(
    "INSERT INTO user_table (user_id, password, email, nickname) VALUES (?,?,?,?)",
    [id, password, email, nickname]
  );
  if (result[0].affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("유저 생성완료", result);
  return result;
};

/**
 * 회원상태 확인
 *
 * @param id
 * @param userStatus
 * @returns
 */
export const checkUserStatus = async (id: string, userStatus?: userStatus): Promise<string[] | void> => {
  const query = "SELECT status FROM user_statuses_table WHERE user_id = ?" + (userStatus ? " AND status = ?" : "");
  const valuse = [id];
  if (userStatus) {
    valuse.push(userStatus);
  }
  const [rows] = await pool.execute<RowDataPacket[]>(query, valuse);
  console.log("유저 상태 체크 성공", rows);
  if (rows.length === 0) {
    return;
  }
  return rows.map((row) => row.status);
};

/**
 * 회원상태 삽입
 *
 * @async
 * @throw
 * @param {string} id
 * @param {userStatus} userStatus
 * @returns {Promise<QueryResult>}
 */
export const insertUserStatus = async (id: string, userStatus: userStatus): Promise<QueryResult> => {
  const [result] = await pool.execute<ResultSetHeader[]>(
    "INSERT INTO user_statuses_table (user_id, status) VALUES (?,?)",
    [id, userStatus]
  );
  if (result[0].affectedRows === 0) {
    throw new Error("조건에 맞지 않아 행을 변경하지 못했습니다");
  }
  console.log("유저 상태 생성 완료", result);
  return result;
};

/**
 * 회원상태 삭제
 *
 * @async
 * @throw
 * @param {string} id
 * @param {userStatus} userStatus
 * @returns {Promise<QueryResult>}
 */
export const deleteUserStatus = async (id: string, userStatus: userStatus): Promise<QueryResult> => {
  const [result] = await pool.execute<ResultSetHeader[]>(
    "DELETE FROM user_statuses_table WHERE user_id = ? AND status = ?",
    [id, userStatus]
  );
  if (result[0].affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("유저 상태 삭제 완료", result);
  return result;
};

/**
 * 토큰 삽입
 *
 * @async
 * @throw
 * @param {string} id
 * @param {tokenType} tokenType
 * @param {string} tokenValue
 * @param {Date} expiresAt
 * @returns {Promise<QueryResult>}
 */
export const insertToken = async (
  id: string,
  tokenType: tokenType,
  tokenValue: string,
  expiresAt: Date
): Promise<QueryResult> => {
  const [result] = await pool.execute<ResultSetHeader[]>(
    "INSERT INTO token_table (user_id, token_type, token_value, expires_at) VALUES (?,?,?,?)",
    [id, tokenType, tokenValue, expiresAt]
  );
  if (result[0].affectedRows === 0) {
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
  const [result] = await pool.execute<ResultSetHeader[]>(
    "DELETE FROM token_table WHERE user_id = ? AND token_type = ? AND token_value = ?",
    [id, tokenType, tokenValue]
  );
  if (result[0].affectedRows === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message);
  }
  console.log("토큰 삭제 완료", result);
  return result;
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
  if ([rows].length === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.EMAIL_VERIFICATION_NOT_FOUND].message);
  }
  console.log("이메일 체크 성공", rows);
  return rows[0].user_id;
};

/**
 * 일반 로그인시 id, password 검사
 *
 * @async
 * @throw
 * @param id
 * @param password
 * @returns {Promise<{ nickname: string }>} 검색 성공시 사용자의 id, nickname를 반환
 */
export const checkUser = async (id: string, password: string): Promise<{ nickname: string }> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT user_id, nickname FROM user_table WHERE id = ? AND password = ?",
    [id, password]
  );
  if ([rows].length === 0) {
    throw new Error(errorCodeAnswer[ErrorCode.USER_NOT_FOUND].message);
  }
  console.log("id, password 체크 성공", rows);
  return rows.map((row) => ({ nickname: row.nickname }))[0];
};

/**
 * id 중복 확인
 *
 * @async
 * @param {string} id
 * @returns {Promise<boolean>} 중복이 있으면 참을 없을시 거짓을 반환(에러는 반환하지 않음 주의)
 */
export const checkIdDuplication = async (id: string): Promise<boolean> => {
  const [rows] = await pool.execute<RowDataPacket[]>("SELECT user_id FROM user_table WHERE user_id = ?", [id]);
  return [rows].length > 0;
};

/**
 * nickname 중복 확인
 *
 * @async
 * @param {string} nickname
 * @returns {Promise<boolean>} 중복이 있으면 참을 없을시 거짓을 반환(에러는 반환하지 않음 주의)
 */
export const checkNicknameDuplication = async (nickname: string): Promise<boolean> => {
  const [rows] = await pool.execute<RowDataPacket[]>("SELECT nickname FROM user_table WHERE nickname = ?", [nickname]);
  return [rows].length > 0;
};

/**
 * email 중복 확인
 *
 * @async
 * @param {string} email
 * @returns {Promise<boolean>} 중복이 있으면 참을 없을시 거짓을 반환(에러는 반환하지 않음 주의)
 */
export const checkEmailDuplication = async (email: string): Promise<boolean> => {
  const [rows] = await pool.execute<RowDataPacket[]>("SELECT email FROM user_table WHERE email = ?", [email]);
  return [rows].length > 0;
};
