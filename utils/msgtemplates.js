const { localDate } = require('../helpers/local-date')

const questions = [
    '今天的心情如何?',
    '請寫下今天的文字紀錄吧!',
    '上傳圖片記錄吧!'
]

const status = ['readonly', 'editable', 'deleting']

const warnings = {
    Update: ['取消更新紀錄', '確認更新紀錄', '是否更新資料？'],
    Delete: ['取消刪除紀錄', '確認刪除紀錄', '是否確認刪除紀錄？']
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
                "text": "新增紀錄",
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
                "text": "刪除紀錄",
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
                "text": "查詢紀錄",
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
                "text": "修改紀錄",
                "data": "update&userClick"
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
    "text": warnings.Update[2],
    "quickReply": {
        "items": [
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": warnings.Update[1],
                    "text": warnings.Update[1]
                }
            },
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": warnings.Update[0],
                    "text": warnings.Update[0]
                }
            }
        ]
    }

}

const quickReplyDelete = {

    "type": "text",
    "text": warnings.Delete[2],
    "quickReply": {
        "items": [
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": warnings.Delete[1],
                    "text": warnings.Delete[1]
                }
            },
            {
                "type": "action",
                "action": {
                    "type": "message",
                    "label": warnings.Delete[0],
                    "text": warnings.Delete[0]
                }
            }
        ]
    }

}

module.exports = { richmenu, datePicker, quickReplyUpdate, quickReplyDelete, questions, status, warnings }