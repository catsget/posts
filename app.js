// server.js
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const Task = require('./models/task');

const app = express();

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Подключение к MongoDB успешно');
    } catch (error) {
        console.error('Ошибка подключения к MongoDB:', error);
        process.exit(1);
    }
}
connectDB();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Главная страница со списком задач
app.get('/', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.render('index', { tasks });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка загрузки задач');
    }
});

// Создание новой задачи
app.post('/add', async (req, res) => {
    try {
        const { title, author } = req.body;
        if (!title || !author) return res.status(400).send('Название и автор обязательны');
        await Task.create({ title, author });
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка создания задачи');
    }
});

// Отметка выполнения
app.post('/toggle/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).send('Задача не найдена');
        task.completed = !task.completed;
        await task.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка обновления задачи');
    }
});

// Удаление задачи
app.post('/delete/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).send('Задача не найдена');
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка удаления задачи');
    }
});

app.listen(4000);
