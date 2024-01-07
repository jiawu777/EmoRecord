const { datePicker } = require('../utils/msgtemplates')
module.exports = {
    pickDate: async function (event, client) {
        try {
            // pick date
            if (event.type === 'postback' && event.postback.data.split('&')[1] !== 'pickDate') {
                // set datetime picker
                let mode = event.postback.data.split('&')[0]
                switch (mode) {
                    case 'new':
                        await client.replyMessage(event.replyToken, datePicker.new)
                        break
                    case 'update':
                        await client.replyMessage(event.replyToken, datePicker.update)
                        break
                    case 'read':
                        await client.replyMessage(event.replyToken, datePicker.read)
                        break
                    case 'delete':
                        await client.replyMessage(event.replyToken, datePicker.delete)
                        break
                    default:
                        console.log('沒有吃到mode')
                }

            } else {
                return event.postback.params.date
            }
        } catch (err) { console.log(err) }
    }
}