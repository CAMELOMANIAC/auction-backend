import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ErrorCode from "../utils/errorCode";

export type UserAuthRequest = Request & {
  user?: string;
};

/**
 * 사용자 인증이 필요한경우 먼저 사용되는 미들웨어
 *
 * @param {UserAuthRequest} req - 인증된 사용자 id가 포함된 커스텀 Request객체
 * @param {Response} res - 일반적인 Response객체
 * @param {NextFunction} next - 다음 미들웨어로 이동하는 함수
 */
const authMiddleware = (req: UserAuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    res.status(401).json({ message: "인증 토큰이 없습니다." });
    return;
  }

  try {
    if (!process.env.JWT_ACCESS_SECRET_KEY) {
      res.status(500).json({ message: "서버 JWT 키를 찾을 수 없습니다" });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
    if (typeof decoded === "string" || !decoded.sub) {
      throw new Error("JWT 키를 찾을 수 없습니다");
    }
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.log("토큰이 만료되었습니다 재발급 요청을 시작하세요");
      res
        .status(401)
        .json({ error: ErrorCode.ACCESS_TOKEN_EXPIRED, message: "토큰이 만료되었습니다 재발급 요청을 시작하세요." });
      return;
    }
    req.user = decoded.sub;
    next();
  } catch (error) {
    res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};

export default authMiddleware;
