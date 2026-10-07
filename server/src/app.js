const express = require('express');
const urlRoutes = require('./routes/url.routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Url shortener API is running app.js');
});

app.use('/api/urls', urlRoutes);

module.exports = app;
