import React from 'react';
import { Heart, Plus, Library as LibraryIcon, Music } from 'lucide-react';
import SongCard from '../components/SongCard';
import { useAuth } from '../context/AuthContext';

export default function LibraryView({ 
    playlists = [], 
    albums = [], 
    likedSongs = [],
    onNavigate, 
    onOpenCreatePlaylist,
    onOpenAuth 
}) {
    const { isAuthenticated } = useAuth();

    return (
        <div className="view-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 className="hero-greeting">Your Library</h1>
                {isAuthenticated && (
                    <button className="btn-primary" onClick={onOpenCreatePlaylist}>
                        <Plus size={18} style={{ marginRight: 6 }} />
                        Create Playlist
                    </button>
                )}
            </div>

            {!isAuthenticated && (
                <div style={{
                    backgroundColor: 'var(--bg-elevated)',
                    padding: 24,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16
                }}>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Enjoy your Library</h3>
                        <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                            Log in to see your playlists, liked songs, and custom collections.
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => onOpenAuth('login')}>
                        Log in
                    </button>
                </div>
            )}

            {/* Liked Songs Tile */}
            <div className="shelf-grid">
                <div 
                    className="media-card"
                    style={{
                        background: 'linear-gradient(135deg, #450af5 0%, #8e8ee5 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        minHeight: 180,
                        cursor: 'pointer'
                    }}
                    onClick={() => onNavigate('liked')}
                >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
                        <Heart size={36} fill="#fff" color="#fff" />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                        Liked Songs
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                        {likedSongs.length} liked {likedSongs.length === 1 ? 'song' : 'songs'}
                    </div>
                </div>

                {playlists.map((playlist) => (
                    <SongCard 
                        key={playlist._id}
                        item={playlist}
                        type="playlist"
                        onClick={() => onNavigate(`playlist-${playlist._id}`)}
                    />
                ))}
            </div>

            {/* Saved Albums Section */}
            {albums.length > 0 && (
                <section className="shelf-section" style={{ marginTop: 24 }}>
                    <h2 className="shelf-title">Saved Albums</h2>
                    <div className="shelf-grid">
                        {albums.map((album) => (
                            <SongCard 
                                key={album._id}
                                item={album}
                                type="album"
                                onClick={() => onNavigate(`album-${album._id}`)}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
