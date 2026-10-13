const Url = require('../models/Url');
const generateCode = require('../utils/generateCode');

async function createUrl({ originalUrl, userId }) {
    // Generate unique shortCode
    let shortCode = generateCode();
    let existing = await Url.findOne({ shortCode });
    let attempts = 0;
    while (existing && attempts < 5) {
        shortCode = generateCode();
        existing = await Url.findOne({ shortCode });
        attempts++;
    }

    const newUrl = await Url.create({
        originalUrl,
        shortCode,
        user: userId || null
    });

    return newUrl;
}

async function getUrlByShortCode(shortCode) {
    return await Url.findOneAndUpdate(
        { shortCode },
        { $inc: { clicks: 1 } },
        { new: true }
    );
}

async function getUrlById(id) {
    return await Url.findById(id);
}

async function getUserUrls(userId) {
    return await Url.find({ user: userId }).sort({ createdAt: -1 });
}

async function deleteUserUrl(id, userId) {
    return await Url.findOneAndDelete({ _id: id, user: userId });
}

async function getUrlStats(id, userId) {
    const query = { _id: id };
    if (userId) {
        query.user = userId;
    }
    return await Url.findOne(query);
}

module.exports = {
    createUrl,
    getUrlByShortCode,
    getUrlAndIncrementClicks: getUrlByShortCode,
    getUrlById,
    getUserUrls,
    deleteUserUrl,
    getUrlStats
};
