import express from "express";
import routes from "./routes";
import pool from "./models/db";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/", routes);

const startServer = async () => {
  try {
    // 데이터베이스 연결 확인을 위해 간단한 쿼리 실행
    await pool.query("SELECT 1");
    console.log("db에 성공적으로 연결되었습니다.");

    app.listen(port, () => {
      console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
    });
  } catch (err) {
    console.error("db연결중 에러가 발생했습니다:", err);
  }
};

startServer();
