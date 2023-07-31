const mongoose = require('mongoose')

const emoSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    answer: { text: [String], image: [String] },
    date: { type: String, required: true },
    questionIndex: { type: Number },
    status: { type: Boolean, required: true }
}, { timestamps: true })

module.exports = mongoose.model('EmoRecord', emoSchema)