// server.js
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const Task = require('./models/task');

const app = express();
const PORT = 3000;

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/tasksDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Главная страница со списком задач
app.get('/', async (req, res) => {
    const tasks = await Task.find();
    res.render('index', { tasks });
});

// Создание новой задачи
app.post('/add', async (req, res) => {
    const { title } = req.body;
    await Task.create({ title, completed: false });
    res.redirect('/');
});

// Отметка выполнения
app.post('/toggle/:id', async (req, res) => {
    const task = await Task.findById(req.params.id);
    task.completed = !task.completed;
    await task.save();
    res.redirect('/');
});

// Удаление задачи
app.post('/delete/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

app.listen(PORT);
