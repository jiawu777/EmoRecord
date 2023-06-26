const dayjs = require('dayjs')
const EmoRecord = require('../models/emo-records')
const [questions] = require('../config/dialogue')
const { downloadImage, uploadImgur } = require('../helpers/image-helpers')
const { datePicker, replyImg } = require('../utils/msgtemplates')


module.exports = {
    createRecord: async function (event, client) {
        try {
            const userId = event.source.userId
            // 為什麼localDate呼叫helpers失敗，必須要放在這邊才行？
            const localDate = dayjs(Date.now(), 'YYYY-MM-DD').format().slice(0, 10)
            // find record with same date & user
            let record = await EmoRecord.findOne({ userId, date: localDate });
            if (!record) {
                record = new EmoRecord({ userId, questionIndex: 0, date: localDate })
            }
            // repeat questions
            const replyToken = event.replyToken;
            const questionIndex = record.questionIndex;

            if (event.type === 'message') {

                // image 處理
                if (event.message.type == 'image' && questionIndex <= questions.length) {
                    const imageId = event.message.id;
                    const downloadUrl = `https://api-data.line.me/v2/bot/message/${imageId}/content`;
                    return downloadImage(downloadUrl)
                        .then(async (imageData) => {
                            // 轉換為 Base64
                            const base64Data = imageData.toString('base64')

                            // 上傳 imgur 並存取imgur url
                            const imgurl = await uploadImgur(base64Data)
                            record.image.push(imgurl)

                            if (record !== null) await record.save();


                            // 已完成回傳答覆
                            if (questionIndex <= questions.length) {
                                await client.replyMessage(replyToken, { type: 'text', text: '所有問題包含圖片皆上傳完成' })
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }
            }
            // 本日未完成跑問題
            if (questionIndex < questions.length) {

                // 向使用者提問
                await client.replyMessage(replyToken, { type: 'text', text: questions[questionIndex] });

                // 第一次呼叫不存入資料庫
                if (record.questionIndex !== 0 && event.type !== 'postback') {
                    record.answer.push(event.message.text)
                }
                if (record !== null) {
                    record.questionIndex += 1
                    await record.save()
                };

            } else if (event.type !== 'message') {
                // 已完成回傳答覆
                await client.replyMessage(replyToken, { type: 'text', text: '所有問題已完成' })
            }

        } catch (err) { console.log(err) }
    },
    readRecord: async function (event, client) {
        try {
            const userId = event.source.userId
            const replyToken = event.replyToken;
            if (event.postback.data !== 'userManual&pickDate') {
                // set datetime picker
                const message = datePicker
                await client.replyMessage(replyToken, message)
            } else {
                const selectedDate = event.postback.params.date
                // find record with same date & user
                let selectRecord = await EmoRecord.findOne({ userId, date: selectedDate });
                if (!selectRecord) {
                    await client.replyMessage(replyToken, { type: 'text', text: `查詢日期 ${selectedDate} 無紀錄` })
                } else {
                    const answers = selectRecord.answer.join('\n')
                    const images = selectRecord.image.join()
                    const replyImg = {
                        "type": "image",
                        "originalContentUrl": images,
                        "previewImageUrl": images,
                        "animated": true
                    }
                    await client.replyMessage(replyToken, [{
                        type: 'text',
                        text: `${selectRecord.date}\n${answers}
                ` }, replyImg])
                }
            }
        } catch (err) { console.log(err) }
    }
}