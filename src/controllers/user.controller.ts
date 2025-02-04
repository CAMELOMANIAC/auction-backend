import { Request, Response } from "express";
import pool from "../models/db";
import { requiredCheck } from "../utils/fuction";
import userStatus from "../utils/userStatusEnum";

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

export const insertUser = async (body: any): Promise<void | Error> => {
  // 쿼리 파라미터 유효성 검사
  const requiredFields = [
    { name: "user_id", type: "string", minLength: 4, maxLength: 20, pattern: /^[a-zA-Z0-9]+$/ },
    { name: "password", type: "string", minLength: 8, maxLength: 20, pattern: /^[a-zA-Z0-9]+$/ },
    { name: "email", type: "string", minLength: 4, maxLength: 20, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { name: "nickname", type: "string", minLength: 2, maxLength: 20, pattern: /^[a-zA-Z0-9]+$/ },
  ];
  const requiredCheckResult = requiredCheck(requiredFields, body);
  if (requiredCheckResult !== null) {
    throw Error(requiredCheckResult.error);
  }

  try {
    const userInsertResult = await pool.execute(
      "INSERT INTO user_table (user_id, password, email, nickname) VALUES (?,?,?,?)",
      [body.id, body.password, body.email, body.nickname]
    );
    console.log("생성완료", userInsertResult[0]);
    const userStatusInsertResult = await pool.execute(
      "INSERT INTO user_statuses_table (user_id, status) VALUES (?,?)",
      [body.id, userStatus.EMAIL_VERIFIED]
    );
    console.log("유저 상태 생성 완료", userStatusInsertResult[0]);
  } catch (err) {
    if (typeof err === "string") {
      throw Error(err);
    } else {
      throw Error(String(err));
    }
  }
};
