const { createRecord, readRecord, deleteRecord } = require('./record-controller')
const { datePicker } = require('../utils/msgtemplates')
module.exports = {
    handlePostbackEvent: async function (event, client) {
        try {
            // 使用者點擊RichMenu選項
            if (event.type === 'postback') {
                const mode = event.postback.data.split('&')[0]
                const act = event.postback.data.split('&')[1]
                console.log(act)
                if (mode === 'new') {
                    await createRecord(event, client)
                } else if (mode === 'read') {
                    await readRecord(event, client)
                } else if (mode === 'delete') {
                    await deleteRecord(event, client)
                }
            } else if (event.type === 'message' && event.message.text !== 'NewRecord') {
                // 使用者回傳文字或圖片訊息
                await createRecord(event, client)
            }
        } catch (err) { console.log(err) }
    }
}