if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const line = require('@line/bot-sdk');

const mongodb = require('./config/mongoose')
const { authenticator } = require('./middleware/auth')
const { handleMessageEvent } = require('./controllers/record-controller')

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

function handleEvent(event) {
  let state = event.postback.data
  switch (state) {
    case 'create':
      handleMessageEvent(event, client)
      break;

    case 'update&delete':
      // not done
      handleMessageEvent(event, client)
  }

}
// set webhook route
app.post('/webhook', line.middleware(lineConfig), authenticator, (req, res) => {
  return res.json(handleEvent(req.body.events[0], client))
});

app.listen(PORT, () => {
  console.log(`app is running`)
})