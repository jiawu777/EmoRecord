const { status, questions } = require('../utils/msgtemplates')
const { downloadImage, uploadImgur } = require('./image-helpers')
const EmoRecord = require('../models/emo-records')
module.exports = {
    inputData: async function inputData(event, client) {
        const userId = event.source.userId
        const record = await EmoRecord.findOne({ userId, status: status[1] })
        try {
            // 重複問題 repeat questions
            let questionIndex = record.questionIndex
            const replyToken = event.replyToken
            if (event.type === 'message') {
                // image 處理
                if (event.message.type == 'image') {
                    const imageId = event.message.id;
                    const downloadUrl = `https://api-data.line.me/v2/bot/message/${imageId}/content`;
                    return downloadImage(downloadUrl)
                        .then(async (imageData) => {
                            // 轉換為 Base64
                            const base64Data = imageData.toString('base64')

                            // 上傳 imgur 並存取imgur url
                            const imgurl = await uploadImgur(base64Data)
                            record.answer.image.push(imgurl)

                            // 已完成回傳答覆
                            if (record.questionIndex >= questions.length) {
                                record.questionIndex = 0
                                record.status = status[0]
                                await record.save()
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
                if (record.questionIndex !== 0 && event.type === 'message') {
                    record.answer.text.push(event.message.text)
                }
                if (record !== null) {
                    record.questionIndex += 1
                    await record.save()
                };

            } else if (record && record.status !== status[0]) {
                // turn record status to false restrict editing
                if (record.questionIndex === questions.length) record.questionIndex = 0
                record.status = status[0]
                await record.save()
                // 已完成回傳答覆
                await client.replyMessage(replyToken, { type: 'text', text: '所有問題已完成' })
            }
        } catch (err) { console.log(err) }
    }
}