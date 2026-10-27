const express = require('express');
const router = express.Router();
const musicControllers = require("../controllers/music.controller")
const multer = require("multer")
const authMiddleware = require("../middlewares/auth")

const upload = multer({
    storage: multer.memoryStorage(),
})

const uploadSongFiles = upload.fields([
    { name: "music", maxCount: 1 },
    { name: "cover", maxCount: 1 }
]);

// Protected routes (Artist)
router.post("/upload", authMiddleware.authArtist, uploadSongFiles, musicControllers.createMusic)
router.post("/album", authMiddleware.authArtist, musicControllers.createAlbum)

// Likes (User-specific)
router.get("/likes", authMiddleware.authUser, musicControllers.getLikedSongs)
router.post("/likes/:songId", authMiddleware.authUser, musicControllers.toggleLikeSong)

// Artist Music Management
router.get("/my", authMiddleware.authArtist, musicControllers.getMyMusics)
router.patch("/:id", authMiddleware.authArtist, uploadSongFiles, musicControllers.updateMusic)
router.delete("/:id", authMiddleware.authArtist, musicControllers.deleteMusic)

// Public / Authenticated browsing
router.get("/", authMiddleware.optionalAuth, musicControllers.getAllMusics)
router.get("/featured", authMiddleware.optionalAuth, musicControllers.getFeaturedMusics)
router.get("/albums", authMiddleware.optionalAuth, musicControllers.getAllAlbums)
router.get("/albums/:albumId", authMiddleware.optionalAuth, musicControllers.getAlbumById)
router.get("/artists", authMiddleware.optionalAuth, musicControllers.getAllArtists)
router.get("/artists/:id", authMiddleware.optionalAuth, musicControllers.getArtistById)
router.get("/:id/stream", musicControllers.streamMusic)
router.get("/:id", authMiddleware.optionalAuth, musicControllers.getMusicById)

module.exports = router;