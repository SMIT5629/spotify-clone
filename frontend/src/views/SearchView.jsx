import React, { useState } from 'react';
import { Search as SearchIcon, Play, Music2 } from 'lucide-react';
import SongCard from '../components/SongCard';
import SongRow from '../components/SongRow';
import { usePlayer } from '../context/PlayerContext';

const GENRES = ['All', 'Synthwave', 'Electronic', 'Indie Pop', 'Ambient'];

export default function SearchView({ 
    songs = [], 
    albums = [], 
    artists = [], 
    searchQuery = '', 
    onNavigate,
    onAddToPlaylist,
    likedSongIds = [],
    onToggleLike
}) {
    const { playTrack } = usePlayer();
    const [selectedGenre, setSelectedGenre] = useState('All');

    // Filter songs based on search query and genre
    const filteredSongs = songs.filter((s) => {
        const matchesQuery = !searchQuery || 
            s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.artist?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.genre?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGenre = selectedGenre === 'All' || 
            s.genre?.toLowerCase() === selectedGenre.toLowerCase();

        return matchesQuery && matchesGenre;
    });

    const filteredAlbums = albums.filter((a) => {
        return !searchQuery || 
            a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.artist?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredArtists = artists.filter((art) => {
        return !searchQuery || 
            art.username?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const topSong = filteredSongs[0];

    return (
        <div className="view-container">
            {/* Genre Filter Chips */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {GENRES.map((g) => (
                    <button
                        key={g}
                        onClick={() => setSelectedGenre(g)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: selectedGenre === g ? '#fff' : 'rgba(255, 255, 255, 0.1)',
                            color: selectedGenre === g ? '#000' : '#fff',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        {g}
                    </button>
                ))}
            </div>

            {/* If user is searching and has results */}
            {searchQuery && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 400px) 1fr', gap: 24 }}>
                        {/* Top Result Card */}
                        {topSong && (
                            <section className="shelf-section">
                                <h2 className="shelf-title">Top result</h2>
                                <div 
                                    className="media-card" 
                                    style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                                    onClick={() => playTrack(topSong, filteredSongs, 0)}
                                >
                                    <div>
                                        <img 
                                            src={topSong.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'} 
                                            alt={topSong.title}
                                            style={{ width: 92, height: 92, borderRadius: 8, objectFit: 'cover', marginBottom: 16 }}
                                        />
                                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                                            {topSong.title}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                                            <span style={{ color: '#fff', fontWeight: 600 }}>{topSong.artist?.username}</span> • Song
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                                        <button 
                                            className="action-play-big"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playTrack(topSong, filteredSongs, 0);
                                            }}
                                            title="Play"
                                        >
                                            <Play size={24} fill="#000" style={{ marginLeft: 2 }} />
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Top Matching Songs List */}
                        <section className="shelf-section">
                            <h2 className="shelf-title">Songs</h2>
                            <table className="track-table">
                                <tbody>
                                    {filteredSongs.slice(0, 4).map((song, i) => (
                                        <SongRow 
                                            key={song._id}
                                            track={song}
                                            index={i}
                                            onPlay={() => playTrack(song, filteredSongs, i)}
                                            onAddToPlaylist={onAddToPlaylist}
                                            isLiked={likedSongIds.includes(song._id)}
                                            onToggleLike={onToggleLike}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </div>

                    {/* Matching Albums */}
                    {filteredAlbums.length > 0 && (
                        <section className="shelf-section">
                            <h2 className="shelf-title">Albums</h2>
                            <div className="shelf-grid">
                                {filteredAlbums.map((album) => (
                                    <SongCard 
                                        key={album._id}
                                        item={album}
                                        type="album"
                                        onClick={() => onNavigate(`album-${album._id}`)}
                                        onPlay={() => {
                                            if (album.musics?.length > 0) playTrack(album.musics[0], album.musics, 0);
                                            else onNavigate(`album-${album._id}`);
                                        }}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Matching Artists */}
                    {filteredArtists.length > 0 && (
                        <section className="shelf-section">
                            <h2 className="shelf-title">Artists</h2>
                            <div className="shelf-grid">
                                {filteredArtists.map((artist) => (
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
                    )}
                </>
            )}

            {/* When not searching: show all songs catalogue */}
            {!searchQuery && (
                <section className="shelf-section">
                    <h2 className="shelf-title">
                        {selectedGenre === 'All' ? 'Browse All Tracks' : `${selectedGenre} Tracks`}
                    </h2>
                    <table className="track-table">
                        <thead>
                            <tr>
                                <th style={{ width: 44 }}>#</th>
                                <th>Title</th>
                                <th>Album / Genre</th>
                                <th className="right">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSongs.map((song, i) => (
                                <SongRow 
                                    key={song._id}
                                    track={song}
                                    index={i}
                                    onPlay={() => playTrack(song, filteredSongs, i)}
                                    onAddToPlaylist={onAddToPlaylist}
                                    isLiked={likedSongIds.includes(song._id)}
                                    onToggleLike={onToggleLike}
                                />
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {filteredSongs.length === 0 && filteredAlbums.length === 0 && filteredArtists.length === 0 && (
                <div className="state-container">
                    <SearchIcon size={48} />
                    <h3>No results found for "{searchQuery}"</h3>
                    <p>Please check the spelling or try searching for another artist, song, or album.</p>
                </div>
            )}
        </div>
    );
}
