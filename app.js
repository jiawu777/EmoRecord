if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const line = require('@line/bot-sdk');
const crypto = require('crypto')
const mongodb = require('./config/mongoose')

const app = express()

const PORT = process.env.PORT
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  channelId: process.env.CHANNEL_ID
}

const questions = [
  '今天的心情如何?',
  '請寫下今天的文字紀錄吧!',
  '是否上傳圖片紀錄? Y / N'
]

const client = new line.Client(config);

// connect mongoose
(async () => {
  await mongodb.connect()
})()

// set event
async function handleEvent(event) {
  // const { questions } = require('./config/dialogue')
  const userId = event.source.userId
  const EmoRecord = require('./models/emo_records')

  // check received event type
  if (event.type !== 'message' || event.message.type !== 'text') {
    message.text = '拍謝，看不懂';
  }
  let record = await EmoRecord.findOne({ userId });
  if (!record) {
    record = new EmoRecord({ userId, questionIndex: 0 })
  }

  const replyToken = event.replyToken;
  const questionIndex = record.questionIndex;
  const userMessage = event.message.text;

  if (questionIndex < questions.length) {
    await client.replyMessage(replyToken, { type: 'text', text: questions[questionIndex] });
    record.answer.push(userMessage)
    record.questionIndex += 1;
  } else {
    await client.replyMessage(replyToken, { type: 'text', text: '所有問題已完成' });
    record.questionIndex = 0;
  }

  await record.save();

}

// set webhook route
app.post('/webhook', line.middleware(config), (req, res) => {
  let signInKey = '';
  try {
    // produce reference header
    signInKey = crypto.createHmac('sha256', config.channelSecret).
      update(Buffer.from(JSON.stringify(req.body)), 'utf8').digest('base64');
  } catch (e) {
    // error handle
    console.log(e)
  }

  // compare if reference header is the same as line official header, if not, return error
  if (signInKey !== req.header('x-Line-Signature')) {
    return res.send(error);
  }
  return res.json(handleEvent(req.body.events[0]))
});

app.listen(PORT, () => {
  console.log(`app is running`)
})