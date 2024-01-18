const mongoose = require('mongoose')

mongoose.Promise = Promise

const connect = () => new Promise((resolve, reject) => {
    const db = mongoose.connection
    db.on('error', () => {
        console.error(`Cannot connect to mongoose.`)
        reject(process.exit(0))
    })
    db.on('open', () => {
        console.info(`Mongoose Connected!`)
        resolve()
    })
    mongoose.connect(process.env.MONGODB_URI)
})

module.exports.connect = connect