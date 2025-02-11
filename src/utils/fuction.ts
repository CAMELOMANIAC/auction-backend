import { Response } from "express";
import { errorCodeAnswer } from "./errorCode";

type requiredFields = {
  name: string;
  type: string;
  minLength: number;
  maxLength: number;
  pattern?: RegExp;
};

/**
 * 쿼리 파라미터 유효성 검사
 *
 * @param {Array<requiredFields>} requiredArray - 검사조건 배열
 * @param {{ [key: string]: any }} data - 검사할 내용으로 사용되는 객체
 * @returns {{ error: string; }} - 검사 실패시 error속성을 가진 객체 또는 성공시 null 반환
 */
export const requiredCheck = (
  requiredArray: Array<requiredFields>,
  data: { [key: string]: any }
): { error: string } | null => {
  for (const field of requiredArray) {
    if (Array.isArray(data[field.name])) {
      // 배열 형식의 값 처리
      if (data[field.name].length === 0) {
        return { error: `${field.name}값이 필요합니다.` };
      }
      for (const value of data[field.name]) {
        if (field.type === "string" && typeof value !== "string") {
          return { error: `${field.name}값은 문자열이어야 합니다.` };
        }
        if (field.minLength && value.length < field.minLength) {
          return { error: `${field.name}값은 최소 ${field.minLength}글자 이상이어야 합니다.` };
        }
        if (field.maxLength && value.length > field.maxLength) {
          return { error: `${field.name}값은 최대 ${field.maxLength}글자 이하이어야 합니다.` };
        }
      }
    } else {
      // 문자열 형식의 값 처리
      if (!data[field.name]) {
        return { error: `${field.name}값이 필요합니다.` };
      }
      if (field.type === "string" && typeof data[field.name] !== "string") {
        return { error: `${field.name}값은 문자열이어야 합니다.` };
      }
      if (field.minLength && data[field.name].length < field.minLength) {
        return { error: `${field.name}값은 최소 ${field.minLength}글자 이상이어야 합니다.` };
      }
      if (field.maxLength && data[field.name].length > field.maxLength) {
        return { error: `${field.name}값은 최대 ${field.maxLength}글자 이하이어야 합니다.` };
      }
    }
  }
  return null;
};

/**
 * 발생한 에러를 서비스 계층에서 핸들링 및 응답하기 위한 함수
 *
 * @param {any} error
 * @param {Response} res
 */
export const handlerError = (error: any, res: Response) => {
  if (error instanceof Error) {
    console.error("에러가 발생했습니다:", error);
    const matchingError = Object.entries(errorCodeAnswer).find(
      ([_errorCode, errorInfo]) => error.message === errorInfo.message
    );

    if (matchingError) {
      const [, errorInfo] = matchingError;
      res.status(errorInfo.status).json({ message: errorInfo.message });
    } else {
      res.status(500).json({ message: "에러가 발생했습니다.", error: error.message });
    }
  } else {
    res.status(500).json({ message: "알수없는 오류 발생했습니다.", error });
  }
};
