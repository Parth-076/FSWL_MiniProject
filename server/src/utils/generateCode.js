const { nanoid } = require('nanoid');

function generateCode (length = 7) {

    return nanoid (length);
}

module.exports = generateCode;