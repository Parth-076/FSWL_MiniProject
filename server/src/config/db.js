const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");

mongoose.connection.on('connected', () => {
    console.log('MongoDB: connected');
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB: disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB: error', err.message);
});

async function connectDB() {
    try {

        await mongoose.connect (MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
    } 
    catch (err) {

        console.error('MongoDB: Initial connection error', err.message);
        process.exit(1);

    }
}

module.exports = connectDB;