const mongoose = require("mongoose");

const { MONGO_DB_URL, MONGO_DB_DBNAME } = require("../config/server-config.js");

// connect db;
const connectDB = async () => {
    try {
        await mongoose.connect(`${MONGO_DB_URL}/${MONGO_DB_DBNAME}`);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1);
    }
};

// close db connection;
const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed successfully");
    } catch (err) {
        console.error("Error closing MongoDB connection:", err.message);
    }
};

module.exports = { connectDB, closeDB };
