const express = require('express');

const routes = express.Router();

const generateCode = require('../utils/generateCode');

routes.post('/' , (req, res) => {

    const { originalUrl } = req.body;

    if (!originalUrl) {
        return res.status(400).json ({
            error: 'original Url is required'
        });
    }

    const shortCode = generateCode();

    res.json ({
        message: 'Recieved URL and Short URL is generated and will be stored in the database soon',
        originalUrl, 
        shortCode
    });


});

module.exports = routes;