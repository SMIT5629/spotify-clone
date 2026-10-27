require("dotenv").config();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const userModel = require("./models/user.model");
const musicModel = require("./models/music.model");
const albumModel = require("./models/album.model");
const playlistModel = require("./models/playlist.model");

async function seed() {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/spotify";
    console.log("Connecting to MongoDB for seeding...");
    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
        console.log("Connected to MongoDB!");
    } catch (e) {
        console.log("Remote failed, trying local MongoDB fallback...");
        await mongoose.connect("mongodb://127.0.0.1:27017/spotify");
        console.log("Connected to local MongoDB!");
    }

    // Clean up existing data for fresh seed
    console.log("Cleaning old test data...");
    await userModel.deleteMany({});
    await musicModel.deleteMany({});
    await albumModel.deleteMany({});
    await playlistModel.deleteMany({});

    console.log("Creating users & artists...");
    const hashedPassword = await bcryptjs.hash("password123", 10);

    const demoUser = await userModel.create({
        username: "musiclover",
        email: "listener@spotify.local",
        password: hashedPassword,
        role: "user"
    });

    const artist1 = await userModel.create({
        username: "The Starboy Collective",
        email: "starboy@artists.spotify",
        password: hashedPassword,
        role: "artist"
    });

    const artist2 = await userModel.create({
        username: "Neon Syndicate",
        email: "neon@artists.spotify",
        password: hashedPassword,
        role: "artist"
    });

    const artist3 = await userModel.create({
        username: "Luna Sol",
        email: "luna@artists.spotify",
        password: hashedPassword,
        role: "artist"
    });

    const artist4 = await userModel.create({
        username: "Apex Ambient",
        email: "apex@artists.spotify",
        password: hashedPassword,
        role: "artist"
    });

    console.log("Creating albums...");
    const album1 = await albumModel.create({
        title: "After Hours Echoes",
        artist: artist1._id,
        coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80",
        description: "Dark synth-pop and nocturnal vibes for driving after midnight."
    });

    const album2 = await albumModel.create({
        title: "Cybernetic Horizon",
        artist: artist2._id,
        coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        description: "High-octane electronic grooves and futuristic basslines."
    });

    const album3 = await albumModel.create({
        title: "Ethereal Wanderlust",
        artist: artist3._id,
        coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
        description: "Gentle acoustic melodies and heartwarming vocal textures."
    });

    const album4 = await albumModel.create({
        title: "Infinite Odyssey",
        artist: artist4._id,
        coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
        description: "Cinematic, deep-focus soundscapes designed to elevate concentration."
    });

    console.log("Creating songs with real audio sources...");
    const songsData = [
        {
            title: "Starry Night Glow",
            artist: artist1._id,
            album: album1._id,
            uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
            duration: 372,
            genre: "Synthwave",
            plays: 1420
        },
        {
            title: "Midnight Drive",
            artist: artist1._id,
            album: album1._id,
            uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80",
            duration: 423,
            genre: "Synthwave",
            plays: 980
        },
        {
            title: "Neon Horizon",
            artist: artist2._id,
            album: album2._id,
            uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
            duration: 350,
            genre: "Electronic",
            plays: 2310
        },
        {
            title: "Cybernetic Pulse",
            artist: artist2._id,
            album: album2._id,
            uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
            duration: 302,
            genre: "Electronic",
            plays: 1750
        },
        {
            title: "Sunlit Memories",
            artist: artist3._id,
            album: album3._id,
            uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
            coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
            duration: 380,
            genre: "Indie Pop",
            plays: 890
        },
        {
            title: "Golden Hour Glow",
            artist: artist3._id,
            album: album3._id,
            uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
            coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80",
            duration: 412,
            genre: "Indie Pop",
            plays: 1120
        },
        {
            title: "Deep Space Reverie",
            artist: artist4._id,
            album: album4._id,
            uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
            coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
            duration: 520,
            genre: "Ambient",
            plays: 3100
        },
        {
            title: "Starlight Voyage",
            artist: artist4._id,
            album: album4._id,
            uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
            coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
            duration: 275,
            genre: "Ambient",
            plays: 2450
        }
    ];

    const createdSongs = await musicModel.insertMany(songsData);

    // Link songs back into albums
    await albumModel.findByIdAndUpdate(album1._id, { musics: [createdSongs[0]._id, createdSongs[1]._id] });
    await albumModel.findByIdAndUpdate(album2._id, { musics: [createdSongs[2]._id, createdSongs[3]._id] });
    await albumModel.findByIdAndUpdate(album3._id, { musics: [createdSongs[4]._id, createdSongs[5]._id] });
    await albumModel.findByIdAndUpdate(album4._id, { musics: [createdSongs[6]._id, createdSongs[7]._id] });

    console.log("Creating curated playlists...");
    await playlistModel.create([
        {
            title: "Today's Top Hits",
            description: "The hottest tracks right now across synthwave, electronic and ambient.",
            coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
            user: demoUser._id,
            musics: [createdSongs[0]._id, createdSongs[2]._id, createdSongs[6]._id, createdSongs[7]._id],
            isPublic: true
        },
        {
            title: "Late Night Drive",
            description: "Nocturnal vibes, glowing city lights, and smooth highway synth melodies.",
            coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80",
            user: demoUser._id,
            musics: [createdSongs[1]._id, createdSongs[0]._id, createdSongs[3]._id],
            isPublic: true
        },
        {
            title: "Deep Focus & Study",
            description: "Ambient frequencies and relaxing tones to keep your brain in the zone.",
            coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
            user: demoUser._id,
            musics: [createdSongs[6]._id, createdSongs[7]._id, createdSongs[4]._id],
            isPublic: true
        }
    ]);

    console.log("Seed completed successfully!");
    console.log(`Summary:
- Users: 1 listener, 4 artists (password: password123)
- Albums: 4
- Songs: ${createdSongs.length}
- Playlists: 3`);

    process.exit(0);
}

seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});
