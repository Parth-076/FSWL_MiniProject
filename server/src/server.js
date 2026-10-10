const app = require('./app');
const { PORT } = require('./config/env.js');
const connectDB = require('./config/db.js');
const mongoose = require('mongoose');


async function start () {

    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

    process.on('SIGINT', async() => {

        console.log('\nShutting Down...');
        server.close();
        await mongoose.connection.close();
        process.exit(0);

    });
}

start();
