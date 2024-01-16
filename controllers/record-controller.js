const EmoRecord = require('../models/emo-records')
const { datePicker, quickReplyUpdate, quickReplyDelete, status, questions, warnings } = require('../utils/msgtemplates')
const { pickDate } = require('../helpers/pick-date')
const { response } = require('express')
const { inputData } = require('../helpers/input-data')


module.exports = {
    createRecord: async function (event, client) {
        try {
            const userId = event.source.userId
            const replyToken = event.replyToken;
            let record = ""

            // 若為訊息回傳，先攔截
            if (event.type === 'message' && event.message.text !== '新增紀錄') {
                return await inputData(event, client)
            }

            const pickedDateNew = await pickDate(event, client)
            // 查詢指定日期紀錄 find record with same date & user
            record = await EmoRecord.findOne({ userId, date: pickedDateNew });
            if (!record) {
                // 若因無指定日期故查無紀錄，返回。 if no picked date info, return
                if (!pickedDateNew) return
                // 若查詢日期無紀錄，則新增紀錄。 if record does not exist, create a new one
                record = new EmoRecord({ userId, questionIndex: 0, date: pickedDateNew, status: status[1] })
                await record.save()
                // 進入問答紀錄 enter Q&A
                await inputData(event, client)
            } else {
                // 若查詢日期有紀錄，詢問使用者是否更新紀錄。 if record exist, ask if user want to update or not
                // 欲更新紀錄，轉到updateRecord函式 if yes, turn to update function
                // 開啟紀錄編輯，若取消編輯再關閉 record switch to editable, so that record can be found.
                record.status = status[1]
                record.save()
                await client.replyMessage(replyToken, [{ type: 'text', text: `${pickedDateNew}已有紀錄` }, quickReplyUpdate])
            }
        } catch (err) { console.log(err) }
    },
    updateRecord: async function (event, client) {
        const userId = event.source.userId
        const replyToken = event.replyToken;
        let record = ""
        if (event.type === 'message') {
            // 使用者新增資料後發現已有資料抉擇是否更新。 User used to create record but found record exist.
            record = await EmoRecord.findOne({ userId, status: status[1] })
            if (event.message.text === warnings.Update[0]) {
                // 若使用者不欲更新資料，資料設回唯讀狀態。 if user don't want to update, switch record status to read only.
                record.status = status[0]
                await record.save()
            } else if (event.message.text === warnings.Update[1]) {
                // 使用者欲更新資料，資料重置。 If user wants to update, reset record. 
                record.answer = []
                await record.save()
                // 進入問答紀錄 enter Q&A
                await inputData(event, client)
            }
        } else {
            // 使用者點擊更新資料 User click on update by themselves
            const pickedDateUpdate = await pickDate(event, client)
            // 查詢指定日期紀錄 find record with same date & user
            record = await EmoRecord.findOne({ userId, date: pickedDateUpdate });
            if (!record) {
                // 若因無指定日期故查無紀錄，返回。 if no picked date info, return
                if (!pickedDateUpdate) return
                // 若查詢日期無紀錄，則新增紀錄。 if record does not exist, create a new one
                return await client.replyMessage(replyToken, { type: 'text', text: `指定日期${record.date} 無紀錄` })
            } else {
                // reset record
                record.answer = []
                record.status = status[1]
                await record.save()

                // 進入問答紀錄 enter Q&A
                await inputData(event, client)
            }
        }
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
                        await client.replyMessage(replyToken, [{ type: 'text', text: ` 選擇紀錄日期為 ${selectedDate} ` }, quickReplyDelete])
                    }
                }
            } else if (event.type === 'message' && event.message.text === status.Delete[3]) {
                // cancel deleting record
                record.status = status.Delete[0]
                await record.updateOne()
                return await client.replyMessage(replyToken, { type: 'text', text: status.Delete[3] })
            } else if (event.type === 'message' && event.message.text === status.Delete[2]) {
                // confirm deleting record
                await client.replyMessage(replyToken, { type: 'text', text: status.Delete[2] })
                return await record.deleteOne()
            }
        } catch (err) { console.log(err) }
    }
}