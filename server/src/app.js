const express = require('express');
const cors = require('cors');
const urlRoutes = require('./routes/url.routes');
const authRoutes = require('./routes/auth.routes');
const { redirectUrl } = require('./controllers/url.controller');
const { validateShortCode } = require('./middlewares/validate.middleware');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const asyncHandler = require('./utils/asyncHandler');

const app = express();

// 1. CORS & Body parser middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// 2. Application routes
app.get('/', (req, res) => {
    res.send('Url shortener API is running app.js');
});

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// Root redirect route with short code validation
app.get('/:shortCode', validateShortCode('shortCode'), asyncHandler(redirectUrl));

// 3. 404 handler for unknown routes
app.use(notFoundHandler);

// 4. Centralized error handler
app.use(errorHandler);

module.exports = app;
