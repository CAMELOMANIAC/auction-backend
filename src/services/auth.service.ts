import { Request, Response } from "express";
import { handlerError } from "../utils/fuction";
import jwt from "jsonwebtoken";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";
import { checkRefleshToken, deleteToken, getTokenValue } from "../controllers/token.controller";
import { UserAuthRequest } from "../middlewares/authMiddleware";
import tokenType from "../utils/tokenType";

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
      sub: decodedToken?.sub,
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

/**
 * 액세스토큰을 이용한 로그아웃
 * 1. db에 저장된 refreshToken값을 가져오기(getTokenValue)
 * 2. db에서 로그아웃 사용자 refreshToken 제거(deleteToken)
 * 3. 클라이언트에게 쿠키제거 요청헤더 추가
 *
 * @param {UserAuthRequest} req - 인증된 사용자 id가 포함된 커스텀 Request객체
 * @param {Response} res - 일반적인 Response객체
 */
export const logout = async (req: UserAuthRequest, res: Response) => {
  const userId = req.user;
  try {
    if (!userId) {
      throw new Error(errorCodeAnswer[ErrorCode.INVAILD_ACCESS_TOKEN].message);
    }
    const refreshTokenValue = await getTokenValue(userId, tokenType.REFRESH_TOKEN);
    await deleteToken(userId, tokenType.REFRESH_TOKEN, refreshTokenValue);
    res.clearCookie("refreshToken");
    res.sendStatus(204);
  } catch (error) {
    handlerError(error, res);
  }
};
