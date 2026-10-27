const mongoose = require("mongoose")

const musicSchema = new mongoose.Schema({
    uri: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    coverUrl: {
        type: String,
        default: ""
    },
    duration: {
        type: Number,
        default: 0
    },
    genre: {
        type: String,
        default: "Pop"
    },
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album"
    },
    plays: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Music", musicSchema)   