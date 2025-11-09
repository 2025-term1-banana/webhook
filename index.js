// server.js
import express from "express";
import axios from "axios";
import { env } from "process";

const app = express();
app.use(express.json());

const SLACK_WEBHOOK_URL = env.SLACK_URL;

async function sendToSlack(message) {
  if (!SLACK_WEBHOOK_URL) {
    console.error("❌ SLACK_WEBHOOK_URL 환경 변수가 설정되지 않았습니다.");
    return;
  }

  try {
    await axios.post(SLACK_WEBHOOK_URL, { text: message });
    console.log("✅ Slack 메시지 전송 성공");
  } catch (error) {
    console.error("❌ Slack 메시지 전송 실패:", error.message);
  }
}

app.post("/", async (req, res) => {
    
  const event = req.get('X-GitHub-Event');
  const payload = req.body;
  
  if (event === 'push') {
      const repo = payload.repository.full_name;
      const branch = payload.ref.split('/').pop();
      const pusher = payload.pusher.name;
      console.log(`🚀 [${repo}] ${pusher} pushed to ${branch}`);
      sendToSlack(`${repo}[${branch}] 俺のコミットが来た！全宇宙が震える！`)
      // 여기에 Slack/Discord 등 알림 코드 추가
}else if (event === 'check_suite') {
    const repo = payload.repository.full_name;
    const status = payload.check_suite.conclusion || payload.check_suite.status;
    const headBranch = payload.check_suite.head_branch;
    const headCommit = payload.check_suite.head_commit?.id?.slice(0,7);
    const htmlUrl = payload.check_suite.head_commit?.url;
    const msg = `🧩 Check Suite in *${repo}* [${headBranch}@${headCommit}] status: *${status}*\n${htmlUrl}`;
    console.log(msg)
    if("success" !== status){
        sendToSlack(`${repo}[${headBranch}] 何度でも立ち上がる…けど、CIは泣いてる！`);
    }else{
        sendToSlack(`${repo}[${headBranch}] デプロイ成功！さあ次の冒険へ…`);
    }
    // await sendSlackMessage(msg);
  }
    console.log(event);
//   await sendToSlack(messageData.text);
  res.status(200).send("ok");
});

// 🚀 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ GitHub Webhook 서버 실행 중: http://localhost:${PORT}`);
});


// (()=>{
//     const messageData = messages["on-sync-failed"];
//     sendToSlack(messageData.text);
// })();