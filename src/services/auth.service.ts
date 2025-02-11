import { Request, Response } from "express";
import { handlerError } from "../utils/fuction";
import jwt from "jsonwebtoken";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";
import { checkRefleshToken } from "../controllers/token.controller";

/**
 * 리프레시 토큰을 이용한 액세스 재발급
 *
 * 1. 리프레시 토큰 검사(jwt.verify)
 * 2. db에 존재하는 리프래시 토큰인지 검사(checkRefleshToken)
 * 3. jwt 토큰 생성(jwt.sign)
 *
 * @async
 * @param {Request} req
 * @param {Response} res
 */
export const refleshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  try {
    // 쿼리 파라미터 유효성 검사
    if (!refreshToken || typeof refreshToken !== "string") {
      throw new Error(errorCodeAnswer[ErrorCode.REFRESH_TOKEN_REQUIRED].message);
    }
    if (!process.env.JWT_REFRESH_SECRET_KEY) {
      throw new Error(errorCodeAnswer[ErrorCode.INVALID_ENVIRONMENT_VARIABLE].message);
    }

    let decodedToken: undefined | jwt.JwtPayload;
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY, async (err, decoded) => {
      if (err) {
        throw new Error(errorCodeAnswer[ErrorCode.INVAILD_REFRESH_TOKEN].message);
      } else {
        if (decoded && typeof decoded === "object") {
          decodedToken = decoded;
        } else {
          throw new Error(errorCodeAnswer[ErrorCode.INVAILD_REFRESH_TOKEN].message);
        }
      }
    });
    if (!decodedToken || !decodedToken.sub) {
      throw new Error(errorCodeAnswer[ErrorCode.INVAILD_REFRESH_TOKEN].message);
    }
    await checkRefleshToken(decodedToken.sub);
    const accessTokenPayload = {
      iss: process.env.BASE_URL + "/auth/refresh",
      sub: decodedToken?.sub,
      aud: process.env.BASE_URL,
    };
    if (!process.env.JWT_ACCESS_SECRET_KEY) {
      throw new Error(errorCodeAnswer[ErrorCode.INVALID_ENVIRONMENT_VARIABLE].message);
    }
    const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_ACCESS_SECRET_KEY, {
      expiresIn: "15m",
      audience: `${process.env.BASE_URL}`,
      issuer: `${process.env.BASE_URL}/auth/refresh`,
    });
    res.status(200).json({ accessToken });
  } catch (error) {
    handlerError(error, res);
  }
};
