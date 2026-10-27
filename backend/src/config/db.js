const mongoose = require("mongoose")

async function connectDB() {
    const primaryUri = process.env.MONGO_URI;
    const fallbackUri = "mongodb://127.0.0.1:27017/spotify";

    if (primaryUri) {
        try {
            await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 3000 });
            console.log("MongoDB Connected Successfully to Remote Database!");
            return;
        } catch (error) {
            console.warn("Remote MongoDB connection failed (" + error.message + "), falling back to local MongoDB...");
        }
    }

    try {
        await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 3000 });
        console.log("MongoDB Connected Successfully to Local Database!");
    } catch (error) {
        console.error("Database connection error: " + error.message);
    }
}
module.exports = connectDB;