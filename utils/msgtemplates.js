const { localDate } = require('../helpers/local-date')

const questions = [
    '今天的心情如何?',
    '請寫下今天的文字紀錄吧!',
    '上傳圖片記錄吧!'
]

const status = {
    CreateAndUpdate: ['CUoff', 'CUon', '確認更新紀錄', '取消更新紀錄', '該日期已有紀錄，是否更新？'],
    Read: ['roff', 'ron'],
    Delete: ['doff', 'don', '確認刪除紀錄', '取消刪除紀錄', '是否確認刪除紀錄？']
}

const richmenu = {
    "size": {
        "width": 2500,
        "height": 1686
    },
    "selected": true,
    "name": "Emo Rich Menu",
    "chatBarText": "EmoRecord",
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
                "text": "NewRecord",
                "data": "new&userClick"
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
                "text": "DeleteRecord",
                "data": "delete&userClick"
            }
        },
        {
            "bounds": {
                "x": 0,
                "y": 843,
                "width": 1250,
                "height": 843
            },
            "action": {
                "type": "postback",
                "text": "ReadRecord",
                "data": "read&userClick"
            }
        },
        {
            "bounds": {
                "x": 1250,
                "y": 843,
                "width": 1250,
                "height": 843
            },
            "action": {
                "type": "postback",
                "text": "EditRecord",
                "data": "edit&userClick"
            }
        }
    ]
}

const datePicker = {
    new: {
        type: 'template',
        altText: '指定日期',
        template: {
            type: 'buttons',
            text: '請選擇新增紀錄日期',
            actions: [
                {
                    type: "datetimepicker",
                    label: "date pick",
                    data: `new&pickDate`,
                    mode: "date",
                    initial: localDate,
                    max: "2100-12-31",
                    min: "2023-06-01"
                }
            ]
        }
    },
    read: {
        type: 'template',
        altText: '指定日期',
        template: {
            type: 'buttons',
            text: '請選擇查詢紀錄日期',
            actions: [
                {
                    type: "datetimepicker",
                    label: "date pick",
                    data: `read&pickDate`,
                    mode: "date",
                    initial: localDate,
                    max: "2100-12-31",
                    min: "2023-06-01"
                }
            ]
        }
    },
    update: {
        type: 'template',
        altText: '指定日期',
        template: {
            type: 'buttons',
            text: '請選擇欲更新紀錄日期',
            actions: [
                {
                    type: "datetimepicker",
                    label: "date pick",
                    data: `update&pickDate`,
                    mode: "date",
                    initial: localDate,
                    max: "2100-12-31",
                    min: "2023-06-01"
                }
            ]
        }
    },
    delete: {
        type: 'template',
        altText: '指定日期',
        template: {
            type: 'buttons',
            text: '請選擇欲刪除紀錄日期',
            actions: [
                {
                    type: "datetimepicker",
                    label: "date pick",
                    data: `delete&pickDate`,
                    mode: "date",
                    initial: localDate,
                    max: "2100-12-31",
                    min: "2023-06-01"
                }
            ]
        }
    }
}

const quickReplyUpdate = {

    "type": "text",
    "text": status.CreateAndUpdate[4],
    "quickReply": {
        "items": [
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": status.CreateAndUpdate[2],
                    "text": status.CreateAndUpdate[2]
                }
            },
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": status.CreateAndUpdate[3],
                    "text": status.CreateAndUpdate[3]
                }
            }
        ]
    }

}

const quickReplyDelete = {

    "type": "text",
    "text": status.Delete[4],
    "quickReply": {
        "items": [
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": status.Delete[2],
                    "text": status.Delete[2]
                }
            },
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": status.Delete[3],
                    "text": status.Delete[3]
                }
            }
        ]
    }

}

module.exports = { richmenu, datePicker, quickReplyUpdate, quickReplyDelete, questions, status }