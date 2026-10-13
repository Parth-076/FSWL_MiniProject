const User = require('../models/User');
const { verifyToken } = require('../utils/token');

async function protect(req, res, next) {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, token missing' });
    }

    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'User not found, token invalid' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Not authorized, token expired or invalid' });
    }
}

async function optionalAuth(req, res, next) {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');
        req.user = user || null;
    } catch {
        req.user = null;
    }

    next();
}

module.exports = {
    protect,
    optionalAuth
};
