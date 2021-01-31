const express = require('express')
const app = express()
const morgan = require('morgan');
const router = require('./api/routes/index');

app.get('/', (req, res) => {
    res.json({
        message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄'
    });
});

// settings
app.set('port', process.env.PORT || 3000)

// middlewares
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use('/api/v1', require('./api/routes/index'))

module.exports = app