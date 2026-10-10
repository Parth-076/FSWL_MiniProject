require('dotenv').config();

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined, create a .env file (see .env.example) and set the MONGO_URI variable');
    process.exit(1);
};

module.exports = {
    PORT: process.env.PORT || 3000, 
    MONGO_URI: process.env.MONGO_URI
}
