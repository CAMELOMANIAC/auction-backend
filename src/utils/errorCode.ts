enum ErrorCode {
  //공용 sql 오류
  NO_ROWS_AFFECTED,

  //이메일 인증 토큰 오류
  EMAIL_VERIFICATION_NOT_FOUND,

  //사용자 오류
  USER_NOT_FOUND,

  //액세스 토큰 오류
  ACCESS_TOKEN_EXPIRED,

  //회원가입 정보 오류
  ID_DUPLICATED,
  EMAIL_DUPLICATED,
  NICKNAME_DUPLICATED,
}

export default ErrorCode;

export const errorCodeAnswer: { [key: number]: { status: number; message: string } } = {
  [ErrorCode.NO_ROWS_AFFECTED]: { status: 404, message: "조건에 맞지 않아 행을 변경하지 못했습니다" },
  [ErrorCode.EMAIL_VERIFICATION_NOT_FOUND]: { status: 404, message: "이메일 인증 토큰이 없습니다" },
  [ErrorCode.USER_NOT_FOUND]: { status: 404, message: "사용자가 없습니다" },
  [ErrorCode.ACCESS_TOKEN_EXPIRED]: { status: 401, message: "토큰이 만료되었습니다 재발급 요청을 시작해주세요" },
  [ErrorCode.ID_DUPLICATED]: { status: 400, message: "이 아이디는 다른 사용자가 이용중입니다" },
  [ErrorCode.EMAIL_DUPLICATED]: { status: 400, message: "이 메일은 다른 사용자가 이용중입니다" },
  [ErrorCode.NICKNAME_DUPLICATED]: { status: 400, message: "이 닉네임은 다른 사용자가 이용중입니다" },
};
