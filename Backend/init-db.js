const { connectToDatabase, insertData } = require('./models/auth');

async function initializeDatabase() {
    const connected = await connectToDatabase();
    if (connected) {
        await insertData();
    }
}

initializeDatabase(); 