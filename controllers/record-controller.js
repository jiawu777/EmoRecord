const EmoRecord = require('../models/emo-records')
const { datePicker, quickReplyUpdate, quickReplyDelete, status, questions, warnings } = require('../utils/msgtemplates')
const { pickDate } = require('../helpers/pick-date')
const { inputData } = require('../helpers/input-data')


module.exports = {
    createRecord: async function (event, client) {
        try {
            const userId = event.source.userId
            const replyToken = event.replyToken;
            let record = ""

            // 若為訊息回傳，先攔截 if reply was message, go to inputData
            if (event.type === 'message' && event.message.text !== '新增紀錄') {
                return await inputData(event, client)
            }
            // 指定新增紀錄日期 pick create record date
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
                // 紀錄狀態改為可編輯 record switch to editable, so that record can be found.
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
            // 指定更新紀錄日期 Pick date to update record
            const pickedDateUpdate = await pickDate(event, client)

            // 查詢指定日期紀錄 find record with same date & user
            record = await EmoRecord.findOne({ userId, date: pickedDateUpdate });
            if (!record) {
                // 若因無指定日期故查無紀錄，返回。 if no picked date info, return
                if (!pickedDateUpdate) return

                // 若查詢日期無紀錄，則回覆查無紀錄訊息。 if record does not exist, return no record exist message.
                return await client.replyMessage(replyToken, { type: 'text', text: `指定日期${pickedDateUpdate} 無紀錄` })
            } else {
                // 重置紀錄 reset record
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
            let record = ''
            // 指定查詢紀錄日期 Pick date to read record
            const pickedDateRead = await pickDate(event, client)

            // 查詢指定日期紀錄 find record with same date & user
            record = await EmoRecord.findOne({ userId, date: pickedDateRead });
            if (!record) {
                // 若因無指定日期故查無紀錄，返回。 if no picked date info, return
                if (!pickedDateRead) return

                // 若查詢日期無紀錄，則回覆查無紀錄訊息。 if record does not exist, return no record exist message.
                return await client.replyMessage(replyToken, { type: 'text', text: `指定日期${pickedDateRead} 無紀錄` })
            } else {
                // 顯示紀錄 print record
                let answers = record.answer.text.join('\n')
                const images = record.answer.image.join()
                const replyImg = {
                    "type": "image",
                    "originalContentUrl": images,
                    "previewImageUrl": images,
                    "animated": true
                }

                if (images) {
                    await client.replyMessage(replyToken, [{
                        type: 'text',
                        text: `${record.date}\n${answers}
    ` }, replyImg])
                } else {
                    await client.replyMessage(replyToken, {
                        type: 'text',
                        text: `${record.date}\n${answers}
    ` })
                }
            }
        } catch (err) { console.log(err) }
    },
    deleteRecord: async function (event, client) {
        try {
            const userId = event.source.userId
            const replyToken = event.replyToken;
            let record = ''

            if (event.type === 'message') {
                record = await EmoRecord.findOne({ userId, status: status[2] })
                if (event.message.text === warnings.Delete[1]) {
                    // 確認刪除，回覆確認刪除訊息。Delete record, reply confirm delete message.
                    await client.replyMessage(replyToken, { type: 'text', text: `確認刪除${record.date}日期紀錄。` })
                    await record.deleteOne()
                } else if (event.message.text === warnings.Delete[0]) {
                    // 取消刪除，回覆取消刪除訊息。 Cancel deletion, reply cancel delete message.
                    record.status = status[0]
                    await record.save()
                    await client.replyMessage(replyToken, { type: 'text', text: `取消刪除${record.date}日期紀錄。` })
                }
            }

            if (event.type === 'postback') {
                const pickedDateDelete = await pickDate(event, client)
                // 查詢指定日期紀錄 find record with same date & user
                record = await EmoRecord.findOne({ userId, date: pickedDateDelete });
                if (!record) {
                    // 若因無指定日期故查無紀錄，返回。 if no picked date info, return
                    if (!pickedDateDelete) return
                    // 若指定日期查無紀錄，回覆查無紀錄訊息。 If no record founded, reply message.
                    await client.replyMessage(replyToken, { type: 'text', text: `查詢日期 ${pickedDateDelete} 無紀錄` })
                } else {
                    // 改變紀錄狀態為deleting
                    record.status = status[2]
                    await record.save()
                    // 查得紀錄，回傳是否確認刪除訊息。Record exist, return delete confirmation message.
                    await client.replyMessage(replyToken, [{ type: 'text', text: ` 是否確認刪除 ${pickedDateDelete} 紀錄？` }, quickReplyDelete])
                }
            }
        } catch (err) { console.log(err) }
    }
}