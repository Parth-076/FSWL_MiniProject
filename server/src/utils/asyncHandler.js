/**
 * Wraps async route handlers to automatically catch and forward errors to Express error handling middleware.
 */
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = asyncHandler;
