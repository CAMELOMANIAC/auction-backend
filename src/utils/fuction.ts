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
