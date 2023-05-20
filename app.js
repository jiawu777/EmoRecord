if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const line = require('@line/bot-sdk');
const crypto = require('crypto')
const app = express()
const PORT = process.env.PORT
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  channelId: process.env.CHANNEL_ID
}

const client = new line.Client(config);

function handleEvent(event) {
  const message = {
    type: 'text',
    text: 'Hello World!'
  }
  //判斷發送過來的訊息種類
  if (event.type !== 'message' || event.message.type !== 'text') {
    message.text = '拍謝，看不懂';
  }
  return client.replyMessage(event.replyToken, message);//回覆訊息
}

//設定webhook路由
app.post('/webhook', line.middleware(config), (req, res) => {
  let signInKey = '';
  try {
    //產生對照組header
    signInKey = crypto.createHmac('sha256', config.channelSecret).
      update(Buffer.from(JSON.stringify(req.body)), 'utf8').digest('base64');
  } catch (e) {
    //產生失敗的處理
    console.log(e)
  }

  //比對產生出的header是否與line官方的header相符，不符就回傳錯誤
  if (signInKey !== req.header('x-Line-Signature')) {
    return res.send(error);
  }
  return res.json(handleEvent(req.body.events[0]))

});

app.listen(PORT, () => {
  console.log(`app is running`)
})