import { Request, Response } from "express";
import { handlerError, requiredCheck } from "../utils/fuction";
import { checkUser, checkUserStatus } from "../controllers/user.controller";
import { userStatusErrorRequestAnswer } from "../utils/userStatusType";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import tokenType from "../utils/tokenType";
import { deleteToken, insertToken } from "../controllers/token.controller";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";

/**
 * 일반 로그인
 *
 * 1. id, password 검사(checkUser)
 * 2. DB에서 회원상태 검사(checkUserStatus)
 * 3. JWT access, refresh 생성 및 응답 전송
 * 4. DB에 저장된 리프래시 토큰을 제거(deleteToken)
 * 5. DB에 리프래시 토큰을 새로 저장(insertToken)
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
    {
      name: "password",
      type: "string",
      minLength: 8,
      maxLength: 20,
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/,
    },
  ];
  const requiredCheckResult = requiredCheck(requiredFields, body);
  if (requiredCheckResult !== null) {
    res.status(400).json({ error: requiredCheckResult.error });
    return;
  }

  try {
    const { nickname } = await checkUser(body.id, body.password);
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
    if (!process.env.JWT_ACCESS_SECRET_KEY || !process.env.JWT_REFRESH_SECRET_KEY) {
      throw new Error(errorCodeAnswer[ErrorCode.INVALID_ENVIRONMENT_VARIABLE].message);
    }
    const accessTokenPayload = {
      sub: body.id,
    };
    const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_ACCESS_SECRET_KEY, {
      expiresIn: "15m",
      audience: process.env.BASE_URL,
      issuer: process.env.BASE_URL + "/auth/login",
    });
    const refreshTokenJWTID = randomUUID();
    const refreshTokenPayload = {
      sub: body.id,
      jwtid: refreshTokenJWTID,
    };
    const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET_KEY, {
      expiresIn: "7d",
      audience: process.env.BASE_URL + "/auth/refresh",
      issuer: process.env.BASE_URL + "/auth/login",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });
    try {
      //deleteToken함수는 행을 변경하지 않으면 에러를 던지지만 이전에 발행된 리프래시 토큰이 존재하지 않을 수 있을수 있으므로 예외처리
      await deleteToken(body.id, tokenType.REFRESH_TOKEN, refreshTokenJWTID);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === errorCodeAnswer[ErrorCode.NO_ROWS_AFFECTED].message) {
          console.log("이전에 발행된 리프래시 토큰이 존재하지 않습니다");
        } else {
          throw error;
        }
      }
    }
    await insertToken(
      body.id,
      tokenType.REFRESH_TOKEN,
      refreshTokenJWTID,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) //7일
    );

    res.json({ id: body.id, nickname: nickname, accessToken: accessToken });
  } catch (error) {
    handlerError(error, res);
  }
};
