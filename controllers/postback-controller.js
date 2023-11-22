const { createRecord, readRecord, updateRecord, deleteRecord } = require('./record-controller')
const status = {
    Create: ['Coff', 'Con'],
    Read: ['roff', 'ron'],
    Update: ['Uoff', 'Uon', '確認更新紀錄', '取消更新紀錄', '是否更新資料？'],
    Delete: ['doff', 'don', '確認刪除紀錄', '取消刪除紀錄', '是否確認刪除紀錄？']
}

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
                if (event.message.text === status.Delete[2] || event.message.text === status.Delete[3]) {
                    await deleteRecord(event, client)
                } else if (event.type === 'message' && (event.message.text === status.Update[2] || event.message.text === status.Update[3])) {
                    await updateRecord(event, client)
                }
            }
        } catch (err) { console.log(err) }
    }
}