const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config();
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db")
const authRoutes = require("./routes/auth.routes")
const musicRoutes = require("./routes/music.route")
const playlistRoutes = require("./routes/playlist.route")
const morgan = require("morgan")

const app = express();
connectDB();

app.use(cors({
    origin: process.env.FRONTEND_URL||"http://localhost:5174",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))

// Routes
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Spotify API", timestamp: new Date() })
})
app.use("/api/auth", authRoutes)
app.use("/api/music", musicRoutes)
app.use("/api/playlists", playlistRoutes)

// Centralized error handling
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err)
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === "production" ? undefined : err.stack
    })
})

module.exports = app;