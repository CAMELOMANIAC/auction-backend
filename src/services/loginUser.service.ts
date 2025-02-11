import { Request, Response } from "express";
import { handlerError, requiredCheck } from "../utils/fuction";
import { checkUser, checkUserStatus, insertToken } from "../controllers/user.controller";
import { userStatusErrorRequestAnswer } from "../utils/userStatusType";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import tokenType from "../utils/tokenType";

/**
 * 일반 로그인
 *
 * 1. id, password 검사(checkUser)
 * 2. DB에서 회원상태 검사(checkUserStatus)
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
      res.status(500).json({ message: "서버 JWT 키를 찾을 수 없습니다" });
      return;
    }
    const accessTokenPayload = {
      iss: process.env.BASE_URL + "/auth/login",
      sub: body.id,
      aud: process.env.BASE_URL,
    };
    const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_ACCESS_SECRET_KEY, { expiresIn: "15m" });
    const refreshTokenJWTID = randomUUID();
    const refreshTokenPayload = {
      iss: process.env.BASE_URL + "/auth/login",
      sub: body.id,
      aud: process.env.BASE_URL + "/auth/refresh",
      jwtid: refreshTokenJWTID,
    };
    const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: "7d" });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });
    await insertToken(
      body.id,
      tokenType.REFRESH_TOKEN,
      refreshTokenJWTID,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    res.json({ id: body.id, nickname: nickname, accessToken: accessToken });
  } catch (error) {
    handlerError(error, res);
  }
};
