enum ErrorCode {
  //공용 sql 오류
  NO_ROWS_AFFECTED,

  //이메일 인증 토큰 오류
  EMAIL_VERIFICATION_NOT_FOUND,

  //사용자 오류
  USER_NOT_FOUND,

  //액세스 토큰 오류
  ACCESS_TOKEN_EXPIRED,
}

export default ErrorCode;

export const errorCodeAnswer: { [key: number]: { status: number; message: string } } = {
  [ErrorCode.NO_ROWS_AFFECTED]: { status: 404, message: "조건에 맞지 않아 행을 변경하지 못했습니다" },
  [ErrorCode.EMAIL_VERIFICATION_NOT_FOUND]: { status: 404, message: "이메일 인증 토큰이 없습니다" },
  [ErrorCode.USER_NOT_FOUND]: { status: 404, message: "사용자가 없습니다" },
};
