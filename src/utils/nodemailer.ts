import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yugyusang12@gmail.com",
    pass: process.env.NODE_MAILER_GMAIL_PASS_KEY,
  },
});

const mailOptions = {
  from: "your-email@gmail.com",
  to: "user-email@example.com",
  subject: "인증 메일",
  text: "인증 링크입니다",
};

transporter.sendMail(mailOptions, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("메일 보내기 성공");
  }
});
