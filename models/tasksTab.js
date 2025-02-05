const mongoose = require('mongoose')

const tasksTabSchema = new mongoose.Schema({
    title: { type: String, required: true },
    tasks: [{ type: Object }],
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('TasksTab', tasksTabSchema)