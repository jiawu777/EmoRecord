const { createAndEditRecord, readRecord, deleteRecord } = require('./record-controller')
const { status } = require('../utils/msgtemplates')

module.exports = {
    handlePostbackEvent: async function (event, client) {
        try {
            // 使用者點擊RichMenu選項
            if (event.type === 'postback') {
                const mode = event.postback.data.split('&')[0]
                if (mode === 'new' || mode === 'edit') {
                    await createAndEditRecord(event, client)
                } else if (mode === 'read') {
                    await readRecord(event, client)
                } else if (mode === 'delete') {
                    await deleteRecord(event, client)
                }
            } else if (event.type === 'message' && (event.message.text === status.Delete[2] || event.message.text === status.Delete[3])) {
                await deleteRecord(event, client)
            } else if (event.type === 'message' && event.message.text !== 'NewRecord') {
                await createAndEditRecord(event, client)
            }
        } catch (err) { console.log(err) }
    }
}