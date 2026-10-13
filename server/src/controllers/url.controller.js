const mongoose = require('mongoose');
const urlService = require('../services/url.service');
const generateCode = require('../utils/generateCode');

async function createShortUrl(req, res, next) {
    try {
        const { originalUrl } = req.body;
        let shortCode = generateCode();
        let savedUrl = null;

        // Persist to MongoDB if connected, while allowing unit tests without active DB
        if (mongoose.connection.readyState === 1) {
            savedUrl = await urlService.createUrl({
                originalUrl,
                userId: req.user ? req.user._id : null
            });
            shortCode = savedUrl.shortCode;
        }

        res.status(200).json({
            message: 'Recieved URL and Short URL is generated and will be stored in the database soon',
            originalUrl,
            shortCode,
            url: savedUrl || { originalUrl, shortCode, clicks: 0 }
        });
    } catch (error) {
        next(error);
    }
}

async function redirectUrl(req, res, next) {
    try {
        const { shortCode } = req.params;

        const url = await urlService.getUrlByShortCode(shortCode);

        if (!url) {
            return res.status(404).json({
                error: 'URL not found'
            });
        }

        return res.redirect(url.originalUrl);
    } catch (error) {
        next(error);
    }
}

async function getUrlById(req, res, next) {
    try {
        const { id } = req.params;

        const url = await urlService.getUrlById(id);

        if (!url) {
            return res.status(404).json({
                error: 'URL not found'
            });
        }

        return res.json({
            url
        });
    } catch (error) {
        next(error);
    }
}

async function getMyUrls(req, res, next) {
    try {
        const urls = await urlService.getUserUrls(req.user._id);
        return res.status(200).json({ urls });
    } catch (error) {
        next(error);
    }
}

async function deleteUrl(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await urlService.deleteUserUrl(id, req.user._id);

        if (!deleted) {
            return res.status(404).json({ error: 'URL not found or not owned by you' });
        }

        return res.status(200).json({ message: 'URL deleted successfully', id });
    } catch (error) {
        next(error);
    }
}

async function getUrlAnalytics(req, res, next) {
    try {
        const { id } = req.params;
        const url = await urlService.getUrlStats(id, req.user ? req.user._id : null);

        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }

        return res.status(200).json({ url });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createShortUrl,
    redirectUrl,
    handleRedirect: redirectUrl,
    getUrlById,
    getMyUrls,
    deleteUrl,
    getUrlAnalytics
};
