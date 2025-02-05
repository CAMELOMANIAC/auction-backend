enum userStatus {
  EMAIL_VERIFY_REQUIRED = "emailVerifyRequired",
}
export default userStatus;

export const userStatusErrorRequestAnswer: { [key: string]: { status: number; message: string } } = {
  [userStatus.EMAIL_VERIFY_REQUIRED]: { status: 403, message: "이메일 인증을 먼저 완료해야합니다" },
};
