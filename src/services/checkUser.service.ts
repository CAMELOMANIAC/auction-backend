import { handlerError } from "../utils/fuction";
import { Request, Response } from "express";
import {
  handleCheckEmailDuplication,
  handleCheckIdDuplication,
  handleCheckNicknameDuplication,
} from "../controllers/user.controller";
import ErrorCode, { errorCodeAnswer } from "../utils/errorCode";

/**
 * id 중복체크
 */
export const checkIdDuplication = async (req: Request, res: Response) => {
  const id = req.query.value;
  try {
    // 쿼리 파라미터 유효성 검사
    if (!id || typeof id !== "string") {
      throw new Error(errorCodeAnswer[ErrorCode.VALUE_REQUIRED].message);
    }
    const isDuplicate = await handleCheckIdDuplication(id);
    if (isDuplicate) {
      throw new Error(errorCodeAnswer[ErrorCode.ID_DUPLICATED].message);
    }
    res.sendStatus(200);
  } catch (error) {
    handlerError(error, res);
  }
};

/**
 * nickname 중복체크
 */
export const checkNameDuplication = async (req: Request, res: Response) => {
  const nickname = req.query.value;
  try {
    // 쿼리 파라미터 유효성 검사
    if (!nickname || typeof nickname !== "string") {
      throw new Error(errorCodeAnswer[ErrorCode.VALUE_REQUIRED].message);
    }
    const isDuplicate = await handleCheckNicknameDuplication(nickname);
    if (isDuplicate) {
      throw new Error(errorCodeAnswer[ErrorCode.NICKNAME_DUPLICATED].message);
    }
    res.sendStatus(200);
  } catch (error) {
    handlerError(error, res);
  }
};

/**
 * email 중복체크
 */
export const checkEmailDuplication = async (req: Request, res: Response) => {
  const email = req.query.value;
  try {
    // 쿼리 파라미터 유효성 검사
    if (!email || typeof email !== "string") {
      throw new Error(errorCodeAnswer[ErrorCode.VALUE_REQUIRED].message);
    }
    const isDuplicate = await handleCheckEmailDuplication(email);
    if (isDuplicate) {
      throw new Error(errorCodeAnswer[ErrorCode.EMAIL_DUPLICATED].message);
    }
    res.sendStatus(200);
  } catch (error) {
    handlerError(error, res);
  }
};
