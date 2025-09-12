const mongoose = require('mongoose');

// Connect to MongoDB
async function connectToDB(url) {
    return await mongoose.connect(url);
}

module.exports = { connectToDB };