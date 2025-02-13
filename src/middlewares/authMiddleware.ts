import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";
import { handlerError } from "../utils/fuction";

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
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  try {
    if (!token || token.split(".").length !== 3) {
      throw new Error(errorCodeAnswer[ErrorCode.ACCESS_TOKEN_REQUIRED].message);
    }
    if (!process.env.JWT_ACCESS_SECRET_KEY) {
      throw new Error(errorCodeAnswer[ErrorCode.INVALID_ENVIRONMENT_VARIABLE].message);
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
    if (typeof decoded === "string" || !decoded.sub) {
      throw new Error(errorCodeAnswer[ErrorCode.INVAILD_ACCESS_TOKEN].message);
    }
    req.user = decoded.sub;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      error.message = errorCodeAnswer[ErrorCode.ACCESS_TOKEN_EXPIRED].message;
    }
    handlerError(error, res);
  }
};

export default authMiddleware;
