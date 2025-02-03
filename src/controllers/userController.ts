import { Request, Response } from "express";
import pool from "../models/db";

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
