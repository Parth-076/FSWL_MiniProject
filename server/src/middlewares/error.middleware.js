/**
 * 404 Not Found middleware for unmatched routes.
 * Returns consistent JSON response.
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        error: `Route not found: ${req.method} ${req.originalUrl}`
    });
}

/**
 * Centralized Express error-handling middleware.
 * Ensures consistent JSON responses, handles specific error types,
 * and ensures production responses never expose stack traces or internal secrets.
 */
function errorHandler(err, req, res, next) {
    // If response was already sent, delegate to default Express handler
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Internal server error';

    // 1. Handle JSON syntax errors from body parser
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Invalid JSON payload';
    }

    // 2. Handle Mongoose CastError (e.g. invalid ObjectId)
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path || 'ID'} format`;
    }

    // 3. Handle Mongoose ValidationError
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message || 'Validation failed';
    }

    // 4. Handle MongoDB duplicate key error (code 11000)
    else if (err.code === 11000) {
        statusCode = 409;
        message = 'Resource already exists';
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // In production, never expose raw server error messages or stack traces for 500 errors
    if (statusCode >= 500) {
        console.error('Server Error:', err);
        if (isProduction) {
            message = 'Internal server error';
        }
    }

    const response = {
        error: message
    };

    // Attach stack trace only in development/test when available and not in production
    if (!isProduction && statusCode >= 500 && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

module.exports = {
    notFoundHandler,
    errorHandler
};
