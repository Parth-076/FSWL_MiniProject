const User = require('../models/User');
const { generateToken } = require('../utils/token');

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (!email || typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password
        });

        const token = generateToken({ id: user._id });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken({ id: user._id });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        next(error);
    }
}

async function getMe(req, res, next) {
    try {
        res.status(200).json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    getMe
};
