const { createAndEditRecord, readRecord, deleteRecord } = require('./record-controller')
const { datePicker } = require('../utils/msgtemplates')
module.exports = {
    handlePostbackEvent: async function (event, client) {
        try {
            // 使用者點擊RichMenu選項
            if (event.type === 'postback') {
                const mode = event.postback.data.split('&')[0]
                const act = event.postback.data.split('&')[1]
                if (mode === 'new' || mode === 'edit') {
                    await createAndEditRecord(event, client)
                } else if (mode === 'read') {
                    await readRecord(event, client)
                } else if (mode === 'delete') {
                    await deleteRecord(event, client)
                }
            } else if (event.type === 'message' && (event.message.text === '取消' || event.message.text === '確認')) {
                await deleteRecord(event, client)
            } else if (event.type === 'message' && event.message.text !== 'NewRecord') {
                await createAndEditRecord(event, client)
            }
        } catch (err) { console.log(err) }
    }
}