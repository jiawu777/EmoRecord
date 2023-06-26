if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const line = require('@line/bot-sdk');

const mongodb = require('./config/mongoose')
const { authenticator } = require('./middleware/auth')
const { createRecord, readRecord } = require('./controllers/record-controller')

const app = express()
const PORT = process.env.PORT || 3000

// line client 設定
const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  channelId: process.env.CHANNEL_ID
}
const client = new line.Client(lineConfig);

// connect mongoose
(async () => {
  await mongodb.connect()
})()

let status = ''
async function handlePostbackEvent(event, client) {
  try {

    // 使用者點擊RichMenu選項
    if (event.type === 'postback') {
      const mode = event.postback.data.split('&')[0]
      const act = event.postback.data.split('&')[1]
      if (mode === 'userManual') {
        status = act
      }
      if (status === 'create') {
        await createRecord(event, client)
      } else if (status === 'read' || status === 'pickDate') {
        await readRecord(event, client)
      }
    } else if (event.type === 'message' && status !== 'read' && event.message.text !== '記錄今日') {
      // 使用者回傳文字或圖片訊息
      await createRecord(event, client)
    }
  } catch (err) { console.log(err) }
}


// set webhook route
app.post('/webhook', line.middleware(lineConfig), authenticator, (req, res) => {
  return res.json(handlePostbackEvent(req.body.events[0], client))
});

app.listen(PORT, () => {
  console.log(`app is running`)
})