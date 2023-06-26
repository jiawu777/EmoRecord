const mongoose = require('mongoose')

const emoSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    answer: [String],
    image: [String],
    date: { type: String, required: true },
    questionIndex: { type: Number },
}, { timestamps: true })

module.exports = mongoose.model('EmoRecord', emoSchema)