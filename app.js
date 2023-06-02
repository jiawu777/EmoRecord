if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const line = require('@line/bot-sdk');
const { ImgurClient } = require('imgur')

const dayjs = require('dayjs')
const axios = require('axios')

const mongodb = require('./config/mongoose')
const EmoRecord = require('./models/emo_records')
const { authenticator } = require('./middleware/auth')

const app = express()

const PORT = process.env.PORT
const lineConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  channelId: process.env.CHANNEL_ID
}

const questions = [
  '今天的心情如何?',
  '請寫下今天的文字紀錄吧!',
  '上傳圖片記錄吧!'
]

const client = new line.Client(lineConfig);

// connect mongoose
(async () => {
  await mongodb.connect()
})()

// download image from 
function downloadImage(url) {
  return axios.get(url, {
    headers: {
      'Authorization': `Bearer ${lineConfig.channelAccessToken}`
    },
    // Q???
    responseType: 'arraybuffer'
  }).then((response) => response.data)
}

// upload base64Data imgur
async function uploadImgur(imgbase64) {
  const client = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
    clientSecret: process.env.IMGUR_CLIENT_SECRET,
    refreshToken: process.env.IMGUR_REFRESH_TOKEN,
  });
  const response = await client.upload({
    image: imgbase64,
    type: 'base64',
    album: process.env.IMGUR_ALBUM_ID
  });
  return response.data.link;
}

// set event
async function handleEvent(event) {
  const userId = event.source.userId


  // check received event type
  if (event.type !== 'message' && event.message.type !== 'text' && event.message.type !== 'image') {
    message.text = '拍謝，看不懂';
  }

  // find record with same date & user
  const localDate = dayjs(Date.now(), 'YYYY-MM-DD').format().slice(0, 10)
  let record = await EmoRecord.findOne({ userId, date: localDate });

  if (!record) {
    record = new EmoRecord({ userId, questionIndex: 0, date: localDate })
  }

  // repeat questions
  const replyToken = event.replyToken;
  const questionIndex = record.questionIndex;
  const userMessage = event.message.text;

  // image 處理
  if (event.message.type == 'image' && questionIndex <= questions.length) {
    const imageId = event.message.id;
    const downloadUrl = `https://api-data.line.me/v2/bot/message/${imageId}/content`;
    return downloadImage(downloadUrl)
      .then(async (imageData) => {
        // 轉換為 Base64
        const base64Data = imageData.toString('base64')

        // 上傳 imgur 並存取imgur url
        record.image = (await uploadImgur(base64Data)).toString()
        await record.save();

        // 已完成回傳答覆
        if (questionIndex <= questions.length) {
          await client.replyMessage(replyToken, { type: 'text', text: '所有問題包含圖片皆上傳完成' })
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // 本日未完成跑問題
  if (questionIndex < questions.length) {

    // 向使用者提問
    await client.replyMessage(replyToken, { type: 'text', text: questions[questionIndex] });

    // 第一次呼叫不存入資料庫
    if (record.questionIndex !== 0) {
      record.answer.push(userMessage)
    }

    record.questionIndex += 1;
    await record.save()

  } else {
    // 已完成回傳答覆
    await client.replyMessage(replyToken, { type: 'text', text: '所有問題已完成' })
  }
}

// set webhook route
app.post('/webhook', line.middleware(lineConfig), authenticator, (req, res) => {
  return res.json(handleEvent(req.body.events[0]))
});

app.listen(PORT, () => {
  console.log(`app is running`)
})