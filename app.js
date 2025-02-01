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

app.get('/add-post', (req, res) => {
    res.render('addPost')
})

app.post('/add-post', async (req, res) => {
    try {
        const { title, content } = req.body
        await Post.create({ title, content })
        res.redirect('/')
    } catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
  });

const PORT = 3000

app.listen(PORT, () => console.log(`Server listen on http://localhost:${PORT}`))
