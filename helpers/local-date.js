const dayjs = require('dayjs')
const localDate = dayjs(Date.now(), 'YYYY-MM-DD').format().slice(0, 10)
module.export = { localDate }
