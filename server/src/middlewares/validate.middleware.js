const mongoose = require('mongoose');

/**
 * Middleware factory to validate required body fields.
 * @param {string|string[]} fields - Field name or list of field names that must be present in req.body
 */
function validateRequired(fields) {
    const requiredFields = Array.isArray(fields) ? fields : [fields];

    return function (req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                error: 'Request body must be a JSON object'
            });
        }

        for (const field of requiredFields) {
            const value = req.body[field];
            const isMissing = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

            if (isMissing) {
                // Preserve existing contract if originalUrl is requested
                const fieldLabel = field === 'originalUrl' ? 'original Url' : field;
                return res.status(400).json({
                    error: `${fieldLabel} is required`
                });
            }
        }

        next();
    };
}

/**
 * Middleware factory to validate that a field contains a valid HTTP or HTTPS URL.
 * @param {string} field - Field name in req.body (defaults to 'originalUrl')
 */
function validateUrl(field = 'originalUrl') {
    return function (req, res, next) {
        const urlValue = req.body?.[field];

        // If field is missing, let validateRequired handle it if used; otherwise skip if optional
        if (urlValue === undefined || urlValue === null || urlValue === '') {
            return next();
        }

        if (typeof urlValue !== 'string') {
            return res.status(400).json({
                error: 'URL must be a string'
            });
        }

        try {
            const parsed = new URL(urlValue.trim());

            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                return res.status(400).json({
                    error: 'URL must use http or https protocol'
                });
            }

            if (!parsed.hostname) {
                return res.status(400).json({
                    error: 'URL must include a valid hostname'
                });
            }

            next();
        } catch {
            return res.status(400).json({
                error: 'Invalid URL format'
            });
        }
    };
}

/**
 * Middleware factory to validate short code parameter in request params.
 * @param {string} paramName - Name of param (defaults to 'shortCode')
 */
function validateShortCode(paramName = 'shortCode') {
    const shortCodeRegex = /^[A-Za-z0-9_-]{1,50}$/;

    return function (req, res, next) {
        const code = req.params?.[paramName];

        if (!code || typeof code !== 'string' || !shortCodeRegex.test(code.trim())) {
            return res.status(400).json({
                error: 'Invalid short code format'
            });
        }

        next();
    };
}

/**
 * Middleware factory to validate MongoDB ObjectId in request params.
 * @param {string} paramName - Name of param (defaults to 'id')
 */
function validateObjectId(paramName = 'id') {
    return function (req, res, next) {
        const id = req.params?.[paramName];
        const isValid = id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id) && mongoose.Types.ObjectId.isValid(id);

        if (!isValid) {
            return res.status(400).json({
                error: 'Invalid ID format'
            });
        }

        next();
    };
}

module.exports = {
    validateRequired,
    validateUrl,
    validateShortCode,
    validateObjectId
};
