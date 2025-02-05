import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yugyusang12@gmail.com",
    pass: process.env.NODE_MAILER_GMAIL_PASS_KEY,
  },
});

export const sendMail = ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  const mailOptions = {
    from: "your-email@gmail.com",
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log("메일 보내기 성공");
    }
  });
};
