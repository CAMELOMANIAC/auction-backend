import { Request, Response } from "express";
import {
  checkEmailToken,
  deleteToken,
  deleteUserStatus,
  insertToken,
  insertUser,
  insertUserStatus,
} from "../controllers/user.controller";
import { handlerError, requiredCheck } from "../utils/fuction";
import { sendMail } from "../utils/nodemailer";
import { randomUUID } from "crypto";
import tokenType from "../utils/tokenType";
import userStatus from "../utils/userStatusType";

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
    {
      name: "password",
      type: "string",
      minLength: 8,
      maxLength: 20,
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/,
    },
    { name: "nickname", type: "string", minLength: 2, maxLength: 12, pattern: /^[a-zA-Z0-9가-힣]+$/ },
    {
      name: "email",
      type: "string",
      minLength: 1,
      maxLength: 45,
      pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    },
  ];
  const requiredCheckResult = requiredCheck(requiredFields, body);
  if (requiredCheckResult !== null) {
    res.status(400).json({ message: requiredCheckResult.error });
    return;
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
    handlerError(error, res);
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
    res.status(400).json({ message: "code 파라메터가 제공되어야합니다." });
    return;
  }

  try {
    const userId = await checkEmailToken(randomCode);
    await deleteToken(userId, tokenType.EMAIL_VERIFICATION_TOKEN, randomCode);
    await deleteUserStatus(userId, userStatus.EMAIL_VERIFY_REQUIRED);
    res.status(200);
  } catch (error) {
    handlerError(error, res);
  }
};
