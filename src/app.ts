import express from "express";
import routes from "./routes";
import pool from "./models/db";
import cookieParser from "cookie-parser";
import corsMiddleware from "./middlewares/corsMiddleware";
import { deleteExpiredTokens } from "./controllers/token.controller";

const app = express();
const port = 3000;

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", routes);

const startServer = async () => {
  try {
    // 데이터베이스 연결 확인을 위해 간단한 쿼리 실행
    await pool.query("SELECT 1");
    console.log("db에 성공적으로 연결되었습니다.");

    let deleteExpiredTokensInterval;
    if (!deleteExpiredTokensInterval) {
      //24시간이 지날때마다 만료된 토큰을 제거
      deleteExpiredTokensInterval = setInterval(deleteExpiredTokens, 3600000 * 24);
    }

    app.listen(port, () => {
      console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    });
  } catch (err) {
    console.error("db연결중 에러가 발생했습니다:", err);
  }
};

startServer();
