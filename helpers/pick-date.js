const { datePicker } = require('../utils/msgtemplates')
module.exports = {
    pickDate: async function (event, client) {
        try {
            // pick date
            if (event.type === 'postback' && event.postback.data.split('&')[1] !== 'pickDate') {
                // set datetime picker
                await client.replyMessage(event.replyToken, datePicker.new)
            } else {
                return event.postback.params.date
            }
        } catch (err) { console.log(err) }
    }
}