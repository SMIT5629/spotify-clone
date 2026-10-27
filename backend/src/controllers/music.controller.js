const musicModel = require("../models/music.model")
const albumModel = require("../models/album.model")
const userModel = require("../models/user.model")
const playlistModel = require("../models/playlist.model")
const musicUpload = require("../services/storage.service")
const fs = require("fs")
const path = require("path")

async function createMusic(req, res) {
    try {
        const { title, duration, genre, albumId } = req.body
        
        if (!title) {
            return res.status(400).json({ message: "Song title is required" })
        }

        const musicFile = req.files && req.files['music'] ? req.files['music'][0] : (req.file || null);
        const coverFile = req.files && req.files['cover'] ? req.files['cover'][0] : null;

        let audioUri = req.body.uri;
        if (musicFile) {
            const result = await musicUpload(musicFile.buffer.toString("base64"), "/spotify/music", "_music")
            audioUri = result.url;
        }

        if (!audioUri) {
            return res.status(400).json({ message: "Audio file or URI is required" })
        }

        let finalCoverUrl = req.body.coverUrl || "";
        if (coverFile) {
            const coverResult = await musicUpload(coverFile.buffer.toString("base64"), "/spotify/covers", "_cover")
            finalCoverUrl = coverResult.url;
        }

        const music = await musicModel.create({
            uri: audioUri,
            title: title.trim(),
            artist: req.user.id,
            coverUrl: finalCoverUrl,
            duration: duration ? Number(duration) : 0,
            genre: genre || "Pop",
            album: albumId || null
        })

        if (albumId) {
            await albumModel.findByIdAndUpdate(albumId, { $addToSet: { musics: music._id } })
        }

        res.status(201).json({
            message: "Music created successfully",
            music: {
                _id: music._id,
                id: music._id,
                title: music.title,
                uri: music.uri,
                artist: music.artist,
                coverUrl: music.coverUrl,
                duration: music.duration,
                genre: music.genre
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to create music", error: error.message })
    }
}

async function createAlbum(req, res) {
    try {
        const { title, musics, coverUrl, description } = req.body

        if (!title) {
            return res.status(400).json({ message: "Album title is required" })
        }

        const album = await albumModel.create({
            title: title,
            artist: req.user.id,
            musics: musics || [],
            coverUrl: coverUrl || "",
            description: description || ""
        })

        if (musics && musics.length > 0) {
            await musicModel.updateMany({ _id: { $in: musics } }, { $set: { album: album._id } })
        }

        res.status(201).json({
            message: "Album created successfully",
            album: {
                id: album._id,
                title: album.title,
                artist: album.artist,
                musics: album.musics,
                coverUrl: album.coverUrl
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to create album", error: error.message })
    }
}

async function getAllMusics(req, res) {
    try {
        const { q, search, genre, artist, limit = 50, page = 1 } = req.query
        const searchQuery = q || search;
        const filter = {}

        if (searchQuery) {
            filter.$or = [
                { title: { $regex: searchQuery, $options: "i" } },
                { genre: { $regex: searchQuery, $options: "i" } }
            ]
        }

        if (genre && genre !== "all") {
            filter.genre = { $regex: new RegExp(`^${genre}$`, "i") }
        }

        if (artist) {
            filter.artist = artist
        }

        const skip = (Math.max(1, Number(page)) - 1) * Number(limit)
        const musics = await musicModel
            .find(filter)
            .skip(skip)
            .limit(Number(limit))
            .populate("artist", "username email")
            .populate("album", "title coverUrl")
            .sort({ createdAt: -1 })

        const total = await musicModel.countDocuments(filter)

        res.status(200).json({
            message: "Musics retrieved successfully",
            musics: musics,
            total,
            page: Number(page),
            limit: Number(limit)
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve musics", error: error.message })
    }
}

async function getFeaturedMusics(req, res) {
    try {
        const featured = await musicModel
            .find()
            .limit(10)
            .populate("artist", "username email")
            .populate("album", "title coverUrl")
            .sort({ plays: -1, createdAt: -1 })

        res.status(200).json({
            message: "Featured musics retrieved successfully",
            musics: featured
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve featured musics", error: error.message })
    }
}

async function getMusicById(req, res) {
    try {
        const { id } = req.params
        const music = await musicModel
            .findById(id)
            .populate("artist", "username email")
            .populate("album", "title coverUrl")

        if (!music) {
            return res.status(404).json({ message: "Music not found" })
        }

        // Increment play count asynchronously
        musicModel.findByIdAndUpdate(id, { $inc: { plays: 1 } }).exec();

        res.status(200).json({
            message: "Music retrieved successfully",
            music: music
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve music", error: error.message })
    }
}

async function getAllAlbums(req, res) {
    try {
        const { q, search } = req.query;
        const filter = {};
        const query = q || search;
        if (query) {
            filter.title = { $regex: query, $options: "i" };
        }

        const albums = await albumModel
            .find(filter)
            .populate("artist", "username email")
            .populate("musics", "title uri coverUrl duration")
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: "Albums retrieved successfully",
            albums: albums
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve albums", error: error.message })
    }
}

async function getAlbumById(req, res) {
    try {
        const albumId = req.params.albumId
        const album = await albumModel
            .findById(albumId)
            .populate("artist", "username email")
            .populate({
                path: "musics",
                populate: { path: "artist", select: "username email" }
            })

        if (!album) {
            return res.status(404).json({ message: "Album not found" })
        }
        res.status(200).json({
            message: "Album retrieved successfully",
            album: album
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve album", error: error.message })
    }
}

async function getAllArtists(req, res) {
    try {
        const artists = await userModel.find({ role: "artist" }).select("username email role avatar createdAt")
        // Also find songs count per artist
        const artistCards = await Promise.all(artists.map(async (art) => {
            const count = await musicModel.countDocuments({ artist: art._id });
            return {
                _id: art._id,
                username: art.username,
                email: art.email,
                role: art.role,
                avatar: art.avatar || "",
                songsCount: count
            }
        }));

        res.status(200).json({
            message: "Artists retrieved successfully",
            artists: artistCards
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve artists", error: error.message })
    }
}

async function getArtistById(req, res) {
    try {
        const { id } = req.params
        const artist = await userModel.findById(id).select("-password")
        if (!artist) {
            return res.status(404).json({ message: "Artist not found" })
        }

        const songs = await musicModel
            .find({ artist: id })
            .populate("album", "title coverUrl")
            .sort({ plays: -1 })

        const albums = await albumModel.find({ artist: id })

        res.status(200).json({
            message: "Artist details retrieved successfully",
            artist: {
                ...artist.toObject(),
                songs,
                albums
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve artist", error: error.message })
    }
}

async function streamMusic(req, res) {
    try {
        const { id } = req.params
        const music = await musicModel.findById(id)
        if (!music || !music.uri) {
            return res.status(404).json({ message: "Audio track not found" })
        }

        // If it's a remote URL, redirect to URL or stream
        if (music.uri.startsWith("http://") || music.uri.startsWith("https://")) {
            return res.redirect(music.uri)
        }

        // If local file path
        const filePath = path.resolve(music.uri)
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Audio file not found on server" })
        }

        const stat = fs.statSync(filePath)
        const fileSize = stat.size
        const range = req.headers.range

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            const chunksize = (end - start) + 1
            const fileStream = fs.createReadStream(filePath, { start, end })
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg',
            }
            res.writeHead(206, head)
            fileStream.pipe(res)
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mpeg',
            }
            res.writeHead(200, head)
            fs.createReadStream(filePath).pipe(res)
        }
    } catch (error) {
        res.status(500).json({ message: "Streaming error", error: error.message })
    }
}

async function getLikedSongs(req, res) {
    try {
        const user = await userModel.findById(req.user.id).populate({
            path: "likedSongs",
            populate: { path: "artist", select: "username email avatar" }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "Liked songs retrieved successfully",
            songs: user.likedSongs || []
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve liked songs", error: error.message });
    }
}

async function toggleLikeSong(req, res) {
    try {
        const { songId } = req.params;
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const song = await musicModel.findById(songId);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        const index = user.likedSongs.findIndex(id => id.toString() === songId);
        let isLiked = false;
        if (index > -1) {
            user.likedSongs.splice(index, 1);
            isLiked = false;
        } else {
            user.likedSongs.push(songId);
            isLiked = true;
        }

        await user.save();

        res.status(200).json({
            message: isLiked ? "Song added to Liked Songs" : "Song removed from Liked Songs",
            isLiked,
            songId
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update like status", error: error.message });
    }
}

async function getMyMusics(req, res) {
    try {
        const musics = await musicModel
            .find({ artist: req.user.id })
            .populate("album", "title coverUrl")
            .populate("artist", "username email avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "My tracks retrieved successfully",
            musics
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve tracks", error: error.message });
    }
}

async function updateMusic(req, res) {
    try {
        const { id } = req.params;
        const { title, genre, duration } = req.body;

        const music = await musicModel.findById(id);
        if (!music) {
            return res.status(404).json({ message: "Song not found" });
        }

        if (music.artist.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only edit your own uploaded songs" });
        }

        if (title && title.trim()) music.title = title.trim();
        if (genre) music.genre = genre;
        if (duration) music.duration = Number(duration);

        // Check if new cover image file or URL is uploaded
        const coverFile = req.files && req.files['cover'] ? req.files['cover'][0] : null;
        if (coverFile) {
            const coverResult = await musicUpload(coverFile.buffer.toString("base64"), "/spotify/covers", "_cover");
            music.coverUrl = coverResult.url;
        } else if (req.body.coverUrl !== undefined) {
            music.coverUrl = req.body.coverUrl;
        }

        await music.save();

        const updatedMusic = await musicModel.findById(id)
            .populate("artist", "username email avatar")
            .populate("album", "title coverUrl");

        res.status(200).json({
            message: "Song updated successfully",
            music: updatedMusic
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update song", error: error.message });
    }
}

async function deleteMusic(req, res) {
    try {
        const { id } = req.params;

        const music = await musicModel.findById(id);
        if (!music) {
            return res.status(404).json({ message: "Song not found" });
        }

        if (music.artist.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own uploaded songs" });
        }

        await musicModel.findByIdAndDelete(id);

        // Clean up references in albums, playlists, and user liked songs
        await albumModel.updateMany({ musics: id }, { $pull: { musics: id } });
        await playlistModel.updateMany({ musics: id }, { $pull: { musics: id } });
        await userModel.updateMany({ likedSongs: id }, { $pull: { likedSongs: id } });

        res.status(200).json({
            message: "Song deleted successfully",
            id
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete song", error: error.message });
    }
}

module.exports = {
    createMusic,
    createAlbum,
    getAllMusics,
    getFeaturedMusics,
    getMusicById,
    getAllAlbums,
    getAlbumById,
    getAllArtists,
    getArtistById,
    streamMusic,
    getLikedSongs,
    toggleLikeSong,
    getMyMusics,
    updateMusic,
    deleteMusic
}