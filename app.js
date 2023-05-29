if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const line = require('@line/bot-sdk');
const crypto = require('crypto')
const dayjs = require('dayjs')
const mongodb = require('./config/mongoose')
const fs = require('fs')
const axios = require('axios')

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
  '上傳圖片記錄吧!'
]

const client = new line.Client(config);

// connect mongoose
(async () => {
  await mongodb.connect()
})()

// download image from 
function downloadImage(url) {
  return axios.get(url, {
    headers: {
      'Authorization': `Bearer ${config.channelAccessToken}`
    },
    // QQQQQQQQQQ??
    responseType: 'arraybuffer'
  }).then((response) => response.data)
}

// // 上傳至 Imgur
// function uploadToImgur(base64Data) {
//   return axios.post('https://api.imgur.com/3/image', {
//     image: base64Data,
//     album: process.env.IMGUR_ALBUM_ID
//   }, {
//     headers: {
//       'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`
//     }
//   });
// }

// set record Today event
async function handleEvent(event) {
  const userId = event.source.userId
  const EmoRecord = require('./models/emo_records')

  // check received event type
  if (event.type !== 'message' && event.message.type !== 'text' && event.message.type !== 'image') {
    message.text = '拍謝，看不懂';
  }

  // find record with same date & user
  const localDate = dayjs(Date.now(), 'YYYY-MM-DD')
  let record = await EmoRecord.findOne({ userId, date: localDate.format().slice(0, 10) });

  if (!record) {
    record = new EmoRecord({ userId, questionIndex: 0, date: localDate.format().slice(0, 10) })
  }

  // repeat questions
  const replyToken = event.replyToken;
  const questionIndex = record.questionIndex;
  const userMessage = event.message.text;

  if (questionIndex < questions.length) {
    await client.replyMessage(replyToken, { type: 'text', text: questions[questionIndex] });
    // image message handle
    if (event.type == 'message' && event.message.type == 'image') {
      const imageId = event.message.id;
      const downloadUrl = `https://api-data.line.me/v2/bot/message/${imageId}/content`;
      return downloadImage(downloadUrl)
        .then((imageData) => {
          // 轉換為 Base64
          const base64Data = imageData.toString('base64').slice(0, 10)
          console.log(base64Data)
          //  return uploadToImgur(base64Data)
          // })
          // .then((imgurResponse) => {
          //   // 取得 Imgur 回應中的圖片連結
          //   const imgUrl = imgurResponse.data.link;

          //   console.log(imgUrl)
          //   // 設定Imgur圖片連結至record
          //   // return record.image = imgUrl
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      record.answer.push(userMessage)
    }
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
  } catch (error) {
    // error handle
    console.log(error)
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