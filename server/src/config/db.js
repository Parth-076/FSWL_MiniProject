const dns = require('node:dns');
const mongoose = require("mongoose");
const { MONGO_URI } = require("./env.js");

// Set public DNS servers to resolve MongoDB Atlas SRV records
// (prevents querySrv ECONNREFUSED when local DNS does not support SRV or defaults to 127.0.0.1)
dns.setServers(['8.8.8.8', '1.1.1.1']);

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