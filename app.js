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

const client = new line.Client(config);

// connect mongoose
(async () => {
  await mongodb.connect()
})

// set event
function handleEvent(event) {
  const message = {
    type: 'text',
    text: 'Hello World!'
  }
  // determine receive event type
  if (event.type !== 'message' || event.message.type !== 'text') {
    message.text = '拍謝，看不懂';
  }

  // reply message
  return client.replyMessage(event.replyToken, message);
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