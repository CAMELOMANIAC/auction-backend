import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const sendEvent = (data: { time: string }) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  //주기적으로 이벤트 전송
  const intervalId = setInterval(() => {
    sendEvent({ time: new Date().toISOString() });
  }, 2000);

  // 클라이언트 연결이 끊어졌을 때 정리
  req.on("close", () => {
    clearInterval(intervalId);
  });
});
export default router;
