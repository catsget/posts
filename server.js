const express = require('express')
const mongoose = require('mongoose')
const app = express()
const morgan = require('morgan')

async function ConnectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to DB')
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}
ConnectDB()

app.set('view engine', 'ejs')
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))

const Post = require('./models/post')

app.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1}).lean()
        res.render('main', { posts })
    } catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
})

app.get('/add-note', (req, res) => {
    res.render('addNote')
})

app.post('/add-note', async (req, res) => {
    try {
        const { author, title, content } = req.body
        await Post.create({ author, title, content })
        res.redirect('/')
    } catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
  });

const PORT = 4000

app.listen(PORT)
