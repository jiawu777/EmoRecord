const questions = [
  '今天的心情如何?',
  '請寫下今天的文字紀錄吧!',
  '上傳圖片記錄吧!'
]


const status = {
  CreateAndUpdate: ['CUoff', 'CUon'],
  Read: ['roff', 'ron'],
  Delete: ['doff', 'don', 'deleteConfirm', 'deleteCancel']
}
module.exports = [questions, status]