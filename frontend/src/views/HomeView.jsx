import React from 'react';
import { Play } from 'lucide-react';
import SongCard from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';

function getGreeting() {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
}

export default function HomeView({ 
    featuredSongs = [], 
    albums = [], 
    artists = [], 
    playlists = [],
    onNavigate,
    onAddToPlaylist
}) {
    const { playTrack } = usePlayer();

    const handlePlaySong = (song) => {
        playTrack(song, featuredSongs);
    };

    const handlePlayAlbum = (album) => {
        if (album.musics && album.musics.length > 0) {
            playTrack(album.musics[0], album.musics, 0);
        } else {
            onNavigate(`album-${album._id}`);
        }
    };

    const handlePlayPlaylist = (playlist) => {
        if (playlist.musics && playlist.musics.length > 0) {
            playTrack(playlist.musics[0], playlist.musics, 0);
        } else {
            onNavigate(`playlist-${playlist._id}`);
        }
    };

    // Quick access items (combine top playlists and albums)
    const quickItems = [
        ...playlists.slice(0, 4).map(p => ({ ...p, itemType: 'playlist' })),
        ...albums.slice(0, 2).map(a => ({ ...a, itemType: 'album' }))
    ];

    return (
        <div className="view-container">
            {/* Header Greeting */}
            <div>
                <h1 className="hero-greeting">{getGreeting()}</h1>
            </div>

            {/* Quick Access Grid */}
            <div className="quick-access-grid">
                {quickItems.map((item) => (
                    <div 
                        key={item._id} 
                        className="quick-card"
                        onClick={() => onNavigate(`${item.itemType}-${item._id}`)}
                    >
                        <img 
                            src={item.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'} 
                            alt={item.title} 
                        />
                        <span className="quick-card-title">{item.title}</span>
                        <button 
                            className="quick-play-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (item.itemType === 'playlist') handlePlayPlaylist(item);
                                else handlePlayAlbum(item);
                            }}
                            title="Play"
                        >
                            <Play size={20} fill="#000" style={{ marginLeft: 2 }} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Featured Songs Shelf */}
            <section className="shelf-section">
                <div className="shelf-header">
                    <h2 className="shelf-title">Featured Tracks</h2>
                    <span className="shelf-link" onClick={() => onNavigate('search')}>Show all</span>
                </div>
                <div className="shelf-grid">
                    {featuredSongs.map((song) => (
                        <SongCard 
                            key={song._id}
                            item={song}
                            type="song"
                            onClick={() => handlePlaySong(song)}
                            onPlay={() => handlePlaySong(song)}
                        />
                    ))}
                </div>
            </section>

            {/* Popular Albums Shelf */}
            <section className="shelf-section">
                <div className="shelf-header">
                    <h2 className="shelf-title">Popular Albums</h2>
                </div>
                <div className="shelf-grid">
                    {albums.map((album) => (
                        <SongCard 
                            key={album._id}
                            item={album}
                            type="album"
                            onClick={() => onNavigate(`album-${album._id}`)}
                            onPlay={() => handlePlayAlbum(album)}
                        />
                    ))}
                </div>
            </section>

            {/* Featured Playlists Shelf */}
            <section className="shelf-section">
                <div className="shelf-header">
                    <h2 className="shelf-title">Curated Playlists</h2>
                </div>
                <div className="shelf-grid">
                    {playlists.map((playlist) => (
                        <SongCard 
                            key={playlist._id}
                            item={playlist}
                            type="playlist"
                            onClick={() => onNavigate(`playlist-${playlist._id}`)}
                            onPlay={() => handlePlayPlaylist(playlist)}
                        />
                    ))}
                </div>
            </section>

            {/* Artists Shelf */}
            <section className="shelf-section">
                <div className="shelf-header">
                    <h2 className="shelf-title">Popular Artists</h2>
                </div>
                <div className="shelf-grid">
                    {artists.map((artist) => (
                        <SongCard 
                            key={artist._id}
                            item={artist}
                            type="artist"
                            onClick={() => onNavigate(`artist-${artist._id}`)}
                            onPlay={() => onNavigate(`artist-${artist._id}`)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
