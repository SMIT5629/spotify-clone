const express = require('express');
const router = express.Router();
const playlistController = require("../controllers/playlist.controller");
const { authUser, optionalAuth } = require("../middlewares/auth");

router.get("/", optionalAuth, playlistController.getAllPlaylists);
router.post("/", authUser, playlistController.createPlaylist);
router.get("/:id", optionalAuth, playlistController.getPlaylistById);
router.patch("/:id", authUser, playlistController.updatePlaylist);
router.post("/:id/songs", authUser, playlistController.addSongToPlaylist);
router.delete("/:id/songs/:songId", authUser, playlistController.removeSongFromPlaylist);

module.exports = router;
