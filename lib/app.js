const express = require('express');
const app = express();

app.use(express.json());
app.use(require('cookie-parser')());

app.use('/api/v1/auth', require('./controllers/auth'));


app.use('/api/v1/users', require('./controllers/users'));

app.use('/api/v1/grams', require('./controllers/grams'));

app.use('/api/v1/comments', require('./controllers/comments'));

app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
