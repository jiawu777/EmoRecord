const { createRecord, readRecord, updateRecord, deleteRecord } = require('./record-controller')
const { warnings } = require('../utils/msgtemplates')
const { inputData } = require('../helpers/input-data')

// const status = {
//     Update: ['取消更新紀錄', '確認更新紀錄'],
//     Delete: ['取消刪除紀錄', '確認刪除紀錄']
// }

module.exports = {
    handlePostbackEvent: async function (event, client) {
        try {
            // 使用者點擊RichMenu選項
            if (event.type === 'postback') {
                let mode = event.postback.data.split('&')[0]
                if (mode === 'new') {
                    await createRecord(event, client)
                } else if (mode === 'read') {
                    await readRecord(event, client)
                } else if (mode === 'update') {
                    await updateRecord(event, client)
                } else if (mode === 'delete') {
                    await deleteRecord(event, client)
                }
            } else if (event.type === 'message') {
                if (event.message.text === warnings.Delete[0] || event.message.text === warnings.Delete[1]) {
                    // 確認是否刪除
                    await deleteRecord(event, client)
                } else if (event.message.text === warnings.Update[0] || event.message.text === warnings.Update[1]) {
                    // if user don't want to edit existing record
                    if (event.type === 'message' && event.message.text === warnings.Update[0]) {
                        // confirm no update when record exist & quit
                        return await client.replyMessage(replyToken, { type: 'text', text: `已取消更新紀錄` })
                    } else {
                        // 確認更新紀錄
                        await updateRecord(event, client)
                    }
                } else {
                    // 使用者回傳待紀錄訊息
                    await inputData(event, client)
                }
            }
        } catch (err) { console.log(err) }
    }
}