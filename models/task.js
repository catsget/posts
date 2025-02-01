const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    title: String,
    completed: Boolean,
    createdAt: { type: Date, default: Date.now },
    author: String
});
module.exports = mongoose.model('Task', taskSchema)
