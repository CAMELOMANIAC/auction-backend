enum ErrorCode {
  //공용 오류
  NO_ROWS_AFFECTED = "NO_ROWS_AFFECTED",
  INVALID_ENVIRONMENT_VARIABLE = "INVALID_ENVIRONMENT_VARIABLE",

  //이메일 인증 토큰 오류
  EMAIL_VERIFICATION_NOT_FOUND = "EMAIL_VERIFICATION_NOT_FOUND",

  //사용자 오류
  USER_NOT_FOUND = "USER_NOT_FOUND",

  //액세스 토큰 오류
  ACCESS_TOKEN_EXPIRED = "ACCESS_TOKEN_EXPIRED",
  INVAILD_ACCESS_TOKEN = "INVAILD_ACCESS_TOKEN",
  ACCESS_TOKEN_REQUIRED = "ACCESS_TOKEN_REQUIRED",

  //리프레시 토큰 오류
  INVAILD_REFRESH_TOKEN = "INVAILD_REFRESH_TOKEN",
  REFRESH_TOKEN_REQUIRED = "REFRESH_TOKEN_REQUIRED",

  //회원가입 오류
  ID_DUPLICATED = "ID_DUPLICATED",
  EMAIL_DUPLICATED = "EMAIL_DUPLICATED",
  NICKNAME_DUPLICATED = "NICKNAME_DUPLICATED",
  VALUE_REQUIRED = "VALUE_REQUIRED",
  CODE_REQUIRED = "CODE_REQUIRED",

  //회원탈퇴 오류
  FAILD_TO_DELETE_USER = "FAILD_TO_DELETE_USER",

  //경매글 작성오류
  MAIN_IMAGE_REQUIRED = "MAIN_IMAGE_REQUIRED",
  IMAGE_NOT_UPLOADED = "NOT_UPLOADED_MAIN_IMAGE",

  //경매글 읽기 오류
  NOT_ALLOWED_ORDER_BY = "NOT_ALLOWED_ORDER_BY",
  AUCTION_ID_REQUIRED = "AUCTION_ID_REQUIRED",

  //입찰 오류
  AUCTION_DATE_EXPIRED = "AUCTION_DATE_EXPIRED",
  HIGHER_BID_EXIST = "HIGHER_BID_EXIST",
  BID_BELOW_STARTING_PRICE = "BID_BELOW_STARTING_PRICE",
  BID_PRICE_REQUIRED = "BID_PRICE_REQUIRED",
}

export default ErrorCode;

export const errorCodeAnswer: { [key: string]: { status: number; message: string } } = {
  [ErrorCode.NO_ROWS_AFFECTED]: { status: 404, message: "조건에 맞지 않아 행을 변경하지 못했습니다" },
  [ErrorCode.INVALID_ENVIRONMENT_VARIABLE]: { status: 500, message: "서버측 환경설정값이 잘못되었습니다" },

  [ErrorCode.EMAIL_VERIFICATION_NOT_FOUND]: { status: 404, message: "이메일 인증 토큰이 없습니다" },

  [ErrorCode.USER_NOT_FOUND]: { status: 404, message: "일치하는 사용자가 없습니다" },

  [ErrorCode.ACCESS_TOKEN_EXPIRED]: { status: 401, message: "토큰이 만료되었습니다 재발급 요청을 시작해주세요" },
  [ErrorCode.INVAILD_ACCESS_TOKEN]: { status: 401, message: "유효하지 않은 액세스 토큰입니다." },
  [ErrorCode.ACCESS_TOKEN_REQUIRED]: { status: 400, message: "액세스 토큰을 제출해야합니다" },

  [ErrorCode.INVAILD_REFRESH_TOKEN]: { status: 401, message: "리프레시 토큰이 유효하지 않습니다" },
  [ErrorCode.REFRESH_TOKEN_REQUIRED]: { status: 400, message: "리프레시 토큰을 제출해야합니다" },

  [ErrorCode.ID_DUPLICATED]: { status: 400, message: "이 아이디는 다른 사용자가 이용중입니다" },
  [ErrorCode.EMAIL_DUPLICATED]: { status: 400, message: "이 메일은 다른 사용자가 이용중입니다" },
  [ErrorCode.NICKNAME_DUPLICATED]: { status: 400, message: "이 닉네임은 다른 사용자가 이용중입니다" },
  [ErrorCode.VALUE_REQUIRED]: { status: 404, message: "value값을 제출해야 합니다" },
  [ErrorCode.CODE_REQUIRED]: { status: 404, message: "code값을 제출해야 합니다" },

  [ErrorCode.FAILD_TO_DELETE_USER]: { status: 500, message: "삭제를 진행하지 못했습니다. 잠시후 다시 시도해주세요" },

  [ErrorCode.MAIN_IMAGE_REQUIRED]: { status: 404, message: "상품 메인 이미지를 제출해야 합니다" },
  [ErrorCode.IMAGE_NOT_UPLOADED]: {
    status: 400,
    message: "상품 이미지를 업로드 할 수 없습니다 이미지를 다시 확인해주세요",
  },

  [ErrorCode.NOT_ALLOWED_ORDER_BY]: { status: 400, message: "허용되지 않은 orderBy값 입니다" },
  [ErrorCode.AUCTION_ID_REQUIRED]: { status: 404, message: "경매글 아이디를 제출해야 합니다" },

  [ErrorCode.AUCTION_DATE_EXPIRED]: { status: 400, message: "이미 종료된 경매입니다" },
  [ErrorCode.HIGHER_BID_EXIST]: { status: 409, message: "이미 상회입찰자가 존재합니다" },
  [ErrorCode.BID_BELOW_STARTING_PRICE]: { status: 400, message: "시작가보다 높은 금액을 입력해야합니다" },
  [ErrorCode.BID_PRICE_REQUIRED]: { status: 400, message: "price값을 제출해야합니다" },
};
