const dayjs = require('dayjs')
const EmoRecord = require('../models/emo-records')
const [questions, status] = require('../config/dialogue')
const { downloadImage, uploadImgur } = require('../helpers/image-helpers')
const { datePicker } = require('../utils/msgtemplates')


module.exports = {
    createAndEditRecord: async function (event, client,) {
        try {
            const userId = event.source.userId
            const replyToken = event.replyToken;

            // find record with same user & status true (opened)
            // status details are in dialogue
            let record = await EmoRecord.findOne({ userId, status: status.CreateAndUpdate[1] });

            // pick date
            let selectedDate = ""
            if (event.type === 'postback' && event.postback.data.split('&')[1] === 'userClick') {
                // set datetime picker
                await client.replyMessage(replyToken, datePicker.new)
            } else if (event.type === 'postback' && event.postback.data.split('&')[1] === 'pickDate') {
                // update selected date 
                selectedDate = event.postback.params.date
            }



            // if user don't want to edit existing record
            if (event.type === 'message' && event.message.text === '否') {
                record.status = status.CreateAndUpdate[0]
                await record.save()
                // confirm not update when record exist & quit
                return await client.replyMessage(replyToken, { type: 'text', text: `取消更新 ${record.date} 紀錄` })
            } else if (event.type === 'message' && event.message.text === '是') {
                // reset record
                selectedDate = record.date
                await record.deleteOne()
                record = new EmoRecord({ userId, questionIndex: 0, date: selectedDate, status: status.CreateAndUpdate[1] })
                await record.save()
            }


            // if none of record status is true
            if (!record) {
                // see if there is a record on selected date
                record = await EmoRecord.findOne({ userId, date: selectedDate })

                if (event.type === 'postback' && event.postback.data.split('&')[1] === 'pickDate') {
                    if (record) {
                        record.status = status.CreateAndUpdate[1]
                        await record.save()
                        await client.replyMessage(replyToken, { type: 'text', text: `${selectedDate} 已有紀錄，是否更新？` })
                    } else {
                        // if there's none record on selected date, create new
                        record = new EmoRecord({ userId, questionIndex: 0, date: selectedDate, status: status.CreateAndUpdate[1] })
                        await record.save()
                    }
                }
            }


            record = await EmoRecord.findOne({ userId, status: status.CreateAndUpdate[1] })
            if (record) {


                // repeat questions
                let questionIndex = record.questionIndex

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

                                if (record !== null) {
                                    record.status = status.CreateAndUpdate[0]
                                    if (record.questionIndex === questions.length) record.questionIndex = 0
                                    await record.save()
                                };

                                // 已完成回傳答覆
                                if (questionIndex <= questions.length) {
                                    if (record.questionIndex === questions.length) record.questionIndex = 0
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

                } else if (record && record.status !== status.CreateAndUpdate[0]) {
                    // turn record status to false restrict editing
                    record.status = status.CreateAndUpdate[0]
                    if (record.questionIndex === questions.length) record.questionIndex = 0
                    record.save()
                    // 已完成回傳答覆
                    await client.replyMessage(replyToken, { type: 'text', text: '所有問題已完成' })
                }
            }

        } catch (err) { console.log(err) }
    },
    readRecord: async function (event, client) {
        try {
            const userId = event.source.userId
            const replyToken = event.replyToken;
            if (event.postback.data.split('&')[1] !== 'pickDate') {
                // set datetime picker
                await client.replyMessage(replyToken, datePicker.read)
            } else {
                const selectedDate = event.postback.params.date
                // find record with same date & user
                let selectRecord = await EmoRecord.findOne({ userId, date: selectedDate });
                if (!selectRecord) {
                    await client.replyMessage(replyToken, { type: 'text', text: `查詢日期 ${selectedDate} 無紀錄` })
                } else {
                    let answers = selectRecord.answer.text.join('\n')
                    const images = selectRecord.answer.image.join()
                    const replyImg = {
                        "type": "image",
                        "originalContentUrl": images,
                        "previewImageUrl": images,
                        "animated": true
                    }

                    if (images) {
                        await client.replyMessage(replyToken, [{
                            type: 'text',
                            text: `${selectRecord.date}\n${answers}
                    ` }, replyImg])
                    } else {
                        await client.replyMessage(replyToken, {
                            type: 'text',
                            text: `${selectRecord.date}\n${answers}
                    ` })
                    }

                }
            }
        } catch (err) { console.log(err) }
    },
    deleteRecord: async function (event, client) {
        try {
            const userId = event.source.userId
            const replyToken = event.replyToken;
            const record = EmoRecord.findOne({ userId, status: status.Delete[1] })

            if (event.type === 'postback') {
                if (event.postback.data.split('&')[1] !== 'pickDate') {
                    // set datetime picker
                    await client.replyMessage(replyToken, datePicker.delete)
                } else {
                    const selectedDate = event.postback.params.date
                    // find record with same date & user
                    let selectRecord = await EmoRecord.findOne({ userId, date: selectedDate });
                    if (!selectRecord) {
                        await client.replyMessage(replyToken, { type: 'text', text: `查詢日期 ${selectedDate} 無紀錄` })
                    } else {
                        selectRecord.status = status.Delete[1]
                        selectRecord.save()
                        await client.replyMessage(replyToken, { type: 'text', text: `是否確認刪除 ${selectedDate} 紀錄？` })
                    }
                }
            } else if (event.type === 'message' && event.message.text === `取消`) {
                // cancel deleting record
                record.status = status.Delete[0]
                await record.updateOne()
                return await client.replyMessage(replyToken, { type: 'text', text: `取消刪除紀錄` })
            } else if (event.type === 'message' && event.message.text === `確認`) {
                // confirm deleting record
                await client.replyMessage(replyToken, { type: 'text', text: `成功刪除紀錄` })
                return await record.deleteOne()
            }
        } catch (err) { console.log(err) }
    }
}