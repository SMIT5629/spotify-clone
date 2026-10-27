import React, { useEffect, useState } from 'react';
import { Play, Pause, CheckCircle2, Clock } from 'lucide-react';
import SongRow from '../components/SongRow';
import SongCard from '../components/SongCard';
import { musicApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export default function ArtistView({ 
    artistId, 
    onNavigate, 
    onAddToPlaylist, 
    likedSongIds = [], 
    onToggleLike 
}) {
    const { user } = useAuth();
    const [artistData, setArtistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

    useEffect(() => {
        const fetchArtist = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await musicApi.getArtistById(artistId);
                setArtistData(data.artist);
            } catch (err) {
                setError(err.message || 'Failed to load artist');
            } finally {
                setLoading(false);
            }
        };

        if (artistId) {
            fetchArtist();
        }
    }, [artistId]);

    const songs = artistData?.songs || [];
    const albums = artistData?.albums || [];
    const isCurrentPlayingHere = songs.some(s => s._id === currentTrack?._id) && isPlaying;

    const handlePlayAll = () => {
        if (songs.length === 0) return;
        if (isCurrentPlayingHere) {
            togglePlay();
        } else {
            playTrack(songs[0], songs, 0);
        }
    };

    if (loading) {
        return (
            <div className="state-container">
                <div className="spinner" />
                <p>Loading artist profile...</p>
            </div>
        );
    }

    if (error || !artistData) {
        return (
            <div className="state-container">
                <p style={{ color: '#ef4444' }}>{error || 'Artist not found'}</p>
            </div>
        );
    }

    return (
        <div className="view-container">
            {/* Artist Banner */}
            <div className="detail-banner">
                <img 
                    src={artistData?.avatar || (user && (user.id === artistId || user._id === artistId) ? user.avatar : "") || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} 
                    alt={artistData?.username || "Artist"}
                    className="detail-cover artist-circle" 
                />
                <div className="detail-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3d91f4', fontSize: '0.9rem', fontWeight: 700 }}>
                        <CheckCircle2 size={18} fill="#3d91f4" color="#000" />
                        <span style={{ color: '#fff' }}>Verified Artist</span>
                    </div>
                    <h1 className="detail-title">{artistData.username}</h1>
                    <div className="detail-meta">
                        <span>{songs.length} tracks</span>
                        <span className="detail-meta-dot">•</span>
                        <span>{albums.length} albums</span>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button 
                    className="action-play-big"
                    onClick={handlePlayAll}
                    disabled={songs.length === 0}
                    title={isCurrentPlayingHere ? "Pause" : "Play Artist"}
                >
                    {isCurrentPlayingHere ? (
                        <Pause size={26} fill="#000" />
                    ) : (
                        <Play size={26} fill="#000" style={{ marginLeft: 2 }} />
                    )}
                </button>

                {user && (user.id === artistId || user._id === artistId) && (
                    <button 
                        className="btn-secondary" 
                        onClick={() => onNavigate && onNavigate('my-music')}
                        style={{ borderRadius: 500, padding: '8px 18px', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        Manage Discography
                    </button>
                )}
            </div>

            {/* Popular Tracks */}
            <section className="shelf-section">
                <h2 className="shelf-title">Popular Tracks</h2>
                <table className="track-table">
                    <thead>
                        <tr>
                            <th style={{ width: 44 }}>#</th>
                            <th>Title</th>
                            <th>Album</th>
                            <th className="right"><Clock size={16} /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {songs.map((song, i) => (
                            <SongRow
                                key={song._id}
                                track={song}
                                index={i}
                                onPlay={() => playTrack(song, songs, i)}
                                onAddToPlaylist={onAddToPlaylist}
                                isLiked={likedSongIds.includes(song._id)}
                                onToggleLike={onToggleLike}
                            />
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Discography / Albums */}
            {albums.length > 0 && (
                <section className="shelf-section" style={{ marginTop: 24 }}>
                    <h2 className="shelf-title">Discography</h2>
                    <div className="shelf-grid">
                        {albums.map((album) => (
                            <SongCard
                                key={album._id}
                                item={album}
                                type="album"
                                onClick={() => onNavigate(`album-${album._id}`)}
                                onPlay={() => onNavigate(`album-${album._id}`)}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
