import { Request, Response } from "express";
import { insertUser } from "../controllers/user.controller";

const registerUser = async (req: Request, res: Response) => {
  const body = req.body;

  try {
    insertUser(body);
    res.status(201);
  } catch (err) {
    console.error("데이터베이스 쿼리 중 에러가 발생했습니다:", err);
    res.status(500).json({ message: "DB 에러", error: err });
  }
};

export default registerUser;

/*
const body = req.body;

// 쿼리 파라미터 유효성 검사
const requiredFields = [
  { name: "user_id", type: "string", minLength: 4, maxLength: 20, pattern: /^[a-zA-Z0-9]+$/ },
  { name: "password", type: "string", minLength: 8, maxLength: 20, pattern: /^[a-zA-Z0-9]+$/ },
  { name: "email", type: "string", minLength: 4, maxLength: 20, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  { name: "nickname", type: "string", minLength: 2, maxLength: 20, pattern: /^[a-zA-Z0-9]+$/ },
];
const requiredCheckResult = requiredCheck(requiredFields, body);
if (!requiredCheckResult === null) {
  res.status(400).json(requiredCheckResult);
  return;
}

try {
  const [rows] = await pool.execute("INSERT INTO user_table (user_id, password, email, nickname) VALUES (?,?,?,?)", [
    body.id,
    body.password,
    body.email,
    body.nickname,
  ]);
  res.status(201).json(rows);
} catch (err) {
  console.error("데이터베이스 쿼리 중 에러가 발생했습니다:", err);
  res.status(500).json({ message: "DB 에러", error: err });
}
  */
