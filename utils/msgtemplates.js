const { localDate } = require('../helpers/local-date')
const richmenu = {
    "size": {
        "width": 2500,
        "height": 843
    },
    "selected": true,
    "name": "Emo Rich Menu",
    "chatBarText": "Emo Rich Menu",
    "areas": [
        {
            "bounds": {
                "x": 0,
                "y": 0,
                "width": 1250,
                "height": 843
            },
            "action": {
                "type": "postback",
                "label": "richmenu",
                "text": "記錄今日",
                "data": "userManual&create"
            }
        },
        {
            "bounds": {
                "x": 1250,
                "y": 0,
                "width": 1250,
                "height": 843
            },
            "action": {
                "type": "postback",
                "label": "richmenu",
                "text": "查詢紀錄",
                "data": "userManual&read"
            }
        }
    ]
}

const datePicker = {
    type: 'template',
    altText: '指定日期',
    template: {
        type: 'buttons',
        text: '請選擇日期',
        actions: [
            {
                type: "datetimepicker",
                label: "date pick",
                data: "userManual&pickDate",
                mode: "date",
                initial: localDate,
                max: "2100-12-31",
                min: "2023-06-01"
            }
        ]
    }
}



module.exports = { richmenu, datePicker }