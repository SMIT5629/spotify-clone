const playlistModel = require("../models/playlist.model")
const musicModel = require("../models/music.model")

async function getAllPlaylists(req, res) {
    try {
        const { my, search } = req.query
        const filter = {}

        if (my && req.user) {
            filter.user = req.user.id
        } else if (!req.user) {
            filter.isPublic = true
        } else {
            // Logged in user: their own playlists OR public playlists
            filter.$or = [
                { user: req.user.id },
                { isPublic: true }
            ]
        }

        if (search) {
            filter.title = { $regex: search, $options: "i" }
        }

        const playlists = await playlistModel
            .find(filter)
            .populate("user", "username email")
            .populate("musics", "title uri coverUrl duration")
            .sort({ updatedAt: -1 })

        res.status(200).json({
            message: "Playlists retrieved successfully",
            playlists
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve playlists", error: error.message })
    }
}

async function getPlaylistById(req, res) {
    try {
        const { id } = req.params
        const playlist = await playlistModel
            .findById(id)
            .populate("user", "username email")
            .populate({
                path: "musics",
                populate: { path: "artist", select: "username email" }
            })

        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" })
        }

        // Privacy check
        if (!playlist.isPublic && (!req.user || req.user.id !== playlist.user._id.toString())) {
            return res.status(403).json({ message: "This playlist is private" })
        }

        res.status(200).json({
            message: "Playlist retrieved successfully",
            playlist
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve playlist", error: error.message })
    }
}

async function createPlaylist(req, res) {
    try {
        const { title, description, coverUrl, isPublic } = req.body

        if (!title) {
            return res.status(400).json({ message: "Playlist title is required" })
        }

        const playlist = await playlistModel.create({
            title: title.trim(),
            description: description || "",
            coverUrl: coverUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
            user: req.user.id,
            musics: [],
            isPublic: isPublic !== undefined ? isPublic : true
        })

        res.status(201).json({
            message: "Playlist created successfully",
            playlist
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to create playlist", error: error.message })
    }
}

async function updatePlaylist(req, res) {
    try {
        const { id } = req.params
        const { title, description, coverUrl, isPublic } = req.body

        const playlist = await playlistModel.findById(id)
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" })
        }

        if (playlist.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only update your own playlists" })
        }

        if (title !== undefined) playlist.title = title.trim()
        if (description !== undefined) playlist.description = description
        if (coverUrl !== undefined) playlist.coverUrl = coverUrl
        if (isPublic !== undefined) playlist.isPublic = isPublic

        await playlist.save()

        res.status(200).json({
            message: "Playlist updated successfully",
            playlist
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to update playlist", error: error.message })
    }
}

async function addSongToPlaylist(req, res) {
    try {
        const { id } = req.params
        const { songId } = req.body

        if (!songId) {
            return res.status(400).json({ message: "songId is required" })
        }

        const playlist = await playlistModel.findById(id)
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" })
        }

        if (playlist.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only edit your own playlists" })
        }

        const song = await musicModel.findById(songId)
        if (!song) {
            return res.status(404).json({ message: "Song not found" })
        }

        // Avoid duplicate in playlist
        const exists = playlist.musics.some(m => m.toString() === songId)
        if (exists) {
            return res.status(409).json({ message: "Song already exists in this playlist" })
        }

        playlist.musics.push(songId)
        await playlist.save()

        const updated = await playlistModel.findById(id).populate({
            path: "musics",
            populate: { path: "artist", select: "username email" }
        })

        res.status(200).json({
            message: "Song added to playlist",
            playlist: updated
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to add song to playlist", error: error.message })
    }
}

async function removeSongFromPlaylist(req, res) {
    try {
        const { id, songId } = req.params

        const playlist = await playlistModel.findById(id)
        if (!playlist) {
            return res.status(404).json({ message: "Playlist not found" })
        }

        if (playlist.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only edit your own playlists" })
        }

        playlist.musics = playlist.musics.filter(m => m.toString() !== songId)
        await playlist.save()

        const updated = await playlistModel.findById(id).populate({
            path: "musics",
            populate: { path: "artist", select: "username email" }
        })

        res.status(200).json({
            message: "Song removed from playlist",
            playlist: updated
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to remove song from playlist", error: error.message })
    }
}

module.exports = {
    getAllPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
}
