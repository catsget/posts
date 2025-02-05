require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

// Подключение моделей
const Task = require('./models/task');
const TasksTab = require('./models/tasksTab');

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
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Главная страница: табы и задачи
app.get('/', async (req, res) => {
    try {
        const tasksTabs = await TasksTab.find().populate('tasks'); // Получаем все табы с задачами
        res.render('index', { tasksTabs });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка загрузки табов');
    }
});

// Создание нового таба
app.post('/addTab', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).send('Название таба обязательно');
        const newTab = await TasksTab.create({ title });
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка создания таба');
    }
});

// Создание новой задачи в табе
app.post('/addTask/:tabId', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).send('Название задачи обязательно');

        const newTask = await Task.create({ title });

        const tasksTab = await TasksTab.findById(req.params.tabId);
        if (!tasksTab) return res.status(404).send('Таб не найден');

        tasksTab.tasks.push(newTask); // Добавляем задачу в таб
        await tasksTab.save();

        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка создания задачи');
    }
});

// Удаление таба и всех его задач
app.post('/deleteTab/:id', async (req, res) => {
    try {
        // Найти и удалить таб
        const tasksTab = await TasksTab.findByIdAndDelete(req.params.id);
        if (!tasksTab) return res.status(404).send('Таб не найден');

        // Удаляем все задачи, связанные с этим табом
        await Task.deleteMany({ _id: { $in: tasksTab.tasks } });

        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка удаления таба');
    }
});


// Отметка выполнения задачи
app.post('/toggle/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).send('Задача не найдена');
        
        task.completed = !task.completed;
        await task.save();

        // Возвращаем обновленную задачу в JSON
        res.json(task);
    } catch (error) {
        res.status(500).send('Ошибка обновления задачи');
    }
});


// Удаление задачи
app.post('/deleteTask/:taskId', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.taskId);
        if (!task) return res.status(404).send('Задача не найдена');

        // Удаляем задачу из таба
        const tasksTab = await TasksTab.findOne({ tasks: req.params.taskId });
        if (tasksTab) {
            tasksTab.tasks.pull(task);
            await tasksTab.save();
        }

        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка удаления задачи');
    }
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 4000');
});
