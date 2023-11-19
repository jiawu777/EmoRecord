const [status] = require('../../config/dialogue')
module.exports = {
    confirmDelete:
    {
        "type": "text", // 1
        "text": status.Delete[4],
        "quickReply": { // 2
            "items": [
                {
                    "type": "message",
                    "label": "Yes",
                    "text": "Yes"
                },
                {
                    "type": "message",
                    "label": "Yes",
                    "text": "Yes"
                }
            ]
        }
    }
}