require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Post = require('./models/Post');

const app = express();

app.set('view engine', 'ejs');

const PORT = 3001;
const db = process.env.MONGODB_URI;

mongoose
    .connect(db)
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

const createPath = (page) => path.resolve(__dirname, 'ejs-views', `${page}.ejs`);

app.listen(PORT, (err) => {
    err ? console.log('err') : console.log(`Listening port ${PORT}`);
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use(express.urlencoded({extended: false}));

app.use(express.static('styles'));

app.get('/', (req, res) => {
    const title = 'Home';
    res.render(createPath('index'), { title });
});

app.get('/contacts', (req, res) => {
    const title = 'Contacts';
    const contacts = [
        { name: 'YouTube', link: 'http://youtube.com' },
        { name: 'Twitter', link: 'http://twitter.com' },
        { name: 'GitHub', link: 'http://github.com' },
    ];

    res.render(createPath('contacts'), { contacts, title });
});

app.get('/posts/:id', (req, res) => {
    const title = 'Post';
    const post = {
        id: '1',
        text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente quidem provident, dolores, vero laboriosam nemo mollitia impedit unde fugit sint eveniet, minima odio ipsum sed recusandae aut iste aspernatur dolorem.',
        title: 'Post title',
        date: '05.05.2021',
        author: 'DOK',
    };
    res.render(createPath('post'), { title, post });
});

app.get('/posts', (req, res) => {
    const title = 'Posts';
    const posts = [
        {
            id: '1',
            text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente quidem provident, dolores, vero laboriosam nemo mollitia impedit unde fugit sint eveniet, minima odio ipsum sed recusandae aut iste aspernatur dolorem.',
            title: 'Post title',
            date: '05.05.2021',
            author: 'Yauhen',
        }
    ];
    res.render(createPath('posts'), { title, posts });
});

app.post('/add-post', (req, res) => {
    const { title, author, text } = req.body;
    const post = new Post({title, author, text});
    post
        .save()
        .then((result) => res.send(result))
        .catch((err) => {
            console.log(err);
            res.render(createPath('error'), { title: 'Error' });
        });
});

app.get('/add-post', (req, res) => {
    const title = 'Add Post';
    res.render(createPath('add-post'), { title });
});

app.get('/about-us', (req, res) => {
    res
        .status(301)
        .redirect('/contacts');
});

app.use((req, res) => {
    const title = 'Error';
    res
        .status(404)
        .render(createPath('error'), { title });
});