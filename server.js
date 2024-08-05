require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const Post = require('./models/Post');
const Contact = require('./models/Contact');

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

app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    const title = 'Home';
    res.render(createPath('index'), { title });
});

app.get('/contacts', (req, res) => {
    const title = 'Contacts';
    Contact
        .find()
        .then((contacts) => {
            res.render(createPath('contacts'), {contacts, title})
        })
        .catch((error) => {
            console.log(error);
            res.render(createPath('error'), { title: 'Error' });
        });
});

app.get('/edit/:id', (req, res) => {
    const title = 'Edit Post';
    Post
        .findById(req.params.id)
        .then((post) => {
            if (post) {
                res.render(createPath('edit-post'), { title, post });
            } else {
                res.status(404).render(createPath('error'), { title: 'Error', message: 'Post not found' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).render(createPath('error'), { title: 'Error', message: 'An error occurred while retrieving the post' });
        });
});

app.put('/edit/:id', (req, res) => {
    const {title, author, text} = req.body;
    const {id} = req.params;
    Post
        .findByIdAndUpdate(id, {title, author, text})
        .then(result => res.redirect(`/posts/${id}`))
        .catch((err) => {
            console.log(err);
            res.status(500).render(createPath('error'), { title: 'Error', message: 'An error occurred while updating the post' });
        });
});

app.get('/posts/:id', (req, res) => {
    const title = 'Post';
    Post
        .findById(req.params.id)
        .then((post) => {
            if (post) {
                res.render(createPath('post'), { title, post });
            } else {
                res.status(404).render(createPath('error'), { title: 'Error', message: 'Post not found' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).render(createPath('error'), { title: 'Error', message: 'An error occurred while retrieving the post' });
        });
});

app.delete('/posts/:id', (req, res) => {
    const title = 'Post';
    Post
        .findByIdAndDelete(req.params.id)
        .then(result => {
            res.sendStatus(200);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).render(createPath('error'), { title: 'Error', message: 'An error occurred while retrieving the post' });
        });
});

app.get('/posts', (req, res) => {
    const title = 'Posts';

    Post
        .find()
        .sort({ createdAt: -1 })
        .then((posts) => {
            res.render(createPath('posts'), {posts, title});
        })
        .catch((err) => {
            console.log(err);
            res.render(createPath('error'), { title: 'Error' });
        });
});

app.post('/add-post', (req, res) => {
    const { title, author, text } = req.body;
    const post = new Post({title, author, text});
    post
        .save()
        .then((result) => {
            res.redirect('/posts');
        })
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