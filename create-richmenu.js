if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const line = require('@line/bot-sdk');
const fs = require('fs')
const { richmenu } = require('./utils/msgtemplates')
const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

// new richmenu & set default 
client.createRichMenu(richmenu)
  .then(async (richMenuId) => {
    console.log(richMenuId)
    await client.setRichMenuImage(richMenuId, fs.createReadStream("./utils/img-CRUD.jpg"))
    await client.setDefaultRichMenu(richMenuId)
    console.log('richMenu created successfully!')
  }).catch(err => console.log(err))