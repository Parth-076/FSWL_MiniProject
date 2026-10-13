const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));

module.exports = router;
