const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('post', PostSchema)
