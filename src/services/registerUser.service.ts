import { Request, Response } from "express";
import {
  checkEmailToken,
  checkUser,
  checkUserStatus,
  deleteToken,
  deleteUserStatus,
  insertToken,
  insertUser,
  insertUserStatus,
} from "../controllers/user.controller";
import { requiredCheck } from "../utils/fuction";
import { sendMail } from "../utils/nodemailer";
import { randomUUID } from "crypto";
import tokenType from "../utils/tokenType";
import userStatus, { userStatusErrorRequestAnswer } from "../utils/userStatusType";
import jwt from "jsonwebtoken";

/**
 * 일반 회원가입
 * 1. DB에 회원정보 삽입(insertUser)
 * 2. DB에 이메일 미인증 회원상태 삽입(insertUserStatus)
 * 3. 이메일 인증 정보 토큰 삽입(insertToken)
 * 3. 이메일 발송(sendMail)
 *
 * @param req
 * @param res
 */
const registerUser = async (req: Request, res: Response) => {
  const body = req.body;

  // 쿼리 파라미터 유효성 검사
  const requiredFields = [
    { name: "id", type: "string", minLength: 4, maxLength: 15, pattern: /^[a-zA-Z0-9]+$/ },
    { name: "password", type: "string", minLength: 8, maxLength: 20, pattern: /^[a-zA-Z0-9]+$/ },
    { name: "email", type: "string", minLength: 1, maxLength: 45, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { name: "nickname", type: "string", minLength: 1, maxLength: 45, pattern: /^[a-zA-Z0-9]+$/ },
  ];
  const requiredCheckResult = requiredCheck(requiredFields, body);
  if (requiredCheckResult !== null) {
    res.status(400).json({ error: requiredCheckResult.error });
  }

  try {
    await insertUser(body.id, body.password, body.email, body.nickname);
    await insertUserStatus(body.id, userStatus.EMAIL_VERIFY_REQUIRED);
    const randomCode = randomUUID();
    await insertToken(
      body.id,
      tokenType.EMAIL_VERIFICATION_TOKEN,
      String(randomCode),
      new Date(new Date().getTime() + 30 * 60 * 1000)
    );
    sendMail({
      to: body.email,
      subject: "경매 사이트 회원가입 인증 메일입니다",
      html:
        "<h1>경매 사이트 인증 메일입니다</h1> <h2><a href='http://localhost:3000/email-verify/" +
        randomCode +
        "'>인증 링크</a> </h2>" +
        "이 링크는 30분동안 사용할 수 있습니다",
    });
    res.status(201);
  } catch (error) {
    console.error("데이터베이스 쿼리 중 에러가 발생했습니다:", error);
    res.status(500).json({ message: "DB 에러", error: error });
  }
};

export default registerUser;

/**
 * 이메일 인증
 * 1. DB에서 인증 토큰 검사(checkEmailToken)
 * 2. DB에서 인증 토큰 제거(deleteToken)
 * 3. DB에서 이메일 미인증 회원상태 제거(deleteUserStatus)
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 */
export const verifyEmail = async (req: Request, res: Response) => {
  const randomCode = req.params.code;
  // 쿼리 파라미터 유효성 검사
  if (!randomCode) {
    res.status(400).json({ error: "code 파라메터가 제공되어야합니다." });
    return;
  }

  try {
    const userId = await checkEmailToken(randomCode);
    await deleteToken(userId, tokenType.EMAIL_VERIFICATION_TOKEN, randomCode);
    await deleteUserStatus(userId, userStatus.EMAIL_VERIFY_REQUIRED);
  } catch (error) {
    console.error("데이터베이스 쿼리 중 에러가 발생했습니다:", error);
    res.status(500).json({ message: "DB 에러", error: error });
  }
};

/**
 * 일반 로그인
 *
 * 1. id, password 검사(checkUser)
 * 2. DB에서 회원상태 검사(checkUserStatus)
 * 3. DB에서 응답에 필요한 정보 검색(구현필요)
 * 3. JWT access, refresh 생성
 * 4. 쿠키로 생성하도록 응답 전송
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 */
export const loginUser = async (req: Request, res: Response) => {
  const body = req.body;
  // 쿼리 파라미터 유효성 검사
  const requiredFields = [
    { name: "id", type: "string", minLength: 4, maxLength: 15, pattern: /^[a-zA-Z0-9]+$/ },
    { name: "password", type: "string", minLength: 8, maxLength: 20, pattern: /^[a-zA-Z0-9]+$/ },
  ];
  const requiredCheckResult = requiredCheck(requiredFields, body);
  if (requiredCheckResult !== null) {
    res.status(400).json({ error: requiredCheckResult.error });
  }

  try {
    await checkUser(body.id, body.password);
    const userStatusArray = await checkUserStatus(body.id);
    //상태 체크에서 문제가 있을시 응답
    const errorStatus = userStatusArray?.some((status) => {
      userStatusErrorRequestAnswer[status] &&
        res
          .status(userStatusErrorRequestAnswer[status].status)
          .json({ message: userStatusErrorRequestAnswer[status].message });
    });
    if (errorStatus) {
      return;
    }
    const payload = { id: body.id, password: body.password };
    if (!process.env.JWT_ACCESS_SECRET_KEY || !process.env.JWT_REFRESH_SECRET_KEY) {
      res.status(500).json({ message: "서버 JWT 키를 찾을 수 없습니다" });
      return;
    }
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: "7d" });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // HTTPS에서만 쿠키 전송
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15분
    });

    // 리프레시 토큰을 HttpOnly 쿠키로 설정하고 특정 경로로 제한
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/refresh", // /refresh 경로에서만 쿠키 전송
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });
    res.json({ id: body.id, nickName: body.nickname });
  } catch (error) {
    console.error("데이터베이스 쿼리 중 에러가 발생했습니다:", error);
    res.status(500).json({ message: "DB 에러", error: error });
  }
};
