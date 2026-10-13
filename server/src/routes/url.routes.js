const express = require('express');
const routes = express.Router();

const {
    createShortUrl,
    redirectUrl,
    getUrlById,
    getMyUrls,
    deleteUrl,
    getUrlAnalytics
} = require('../controllers/url.controller');
const {
    validateRequired,
    validateUrl,
    validateShortCode,
    validateObjectId
} = require('../middlewares/validate.middleware');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/urls - Create short URL (supports anonymous or authenticated user)
routes.post(
    '/',
    validateRequired('originalUrl'),
    validateUrl('originalUrl'),
    optionalAuth,
    asyncHandler(createShortUrl)
);

// GET /api/urls/user/my-urls - List URLs owned by authenticated user
routes.get(
    '/user/my-urls',
    protect,
    asyncHandler(getMyUrls)
);

// GET /api/urls/id/:id - Lookup URL by MongoDB ObjectId with parameter validation
routes.get(
    '/id/:id',
    validateObjectId('id'),
    asyncHandler(getUrlById)
);

// GET /api/urls/:id/analytics - Get stats for a URL by ID
routes.get(
    '/:id/analytics',
    validateObjectId('id'),
    optionalAuth,
    asyncHandler(getUrlAnalytics)
);

// DELETE /api/urls/:id - Delete URL by ID (protected, owner only)
routes.delete(
    '/:id',
    protect,
    validateObjectId('id'),
    asyncHandler(deleteUrl)
);

// GET /api/urls/:shortCode - Redirect by short code with parameter validation
routes.get(
    '/:shortCode',
    validateShortCode('shortCode'),
    asyncHandler(redirectUrl)
);

module.exports = routes;