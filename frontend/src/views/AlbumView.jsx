import React, { useEffect, useState } from 'react';
import { Play, Pause, Clock, Disc } from 'lucide-react';
import SongRow from '../components/SongRow';
import { musicApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';

export default function AlbumView({ 
    albumId, 
    onNavigate, 
    onAddToPlaylist, 
    likedSongIds = [], 
    onToggleLike 
}) {
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

    useEffect(() => {
        const fetchAlbum = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await musicApi.getAlbumById(albumId);
                setAlbum(data.album);
            } catch (err) {
                setError(err.message || 'Failed to load album');
            } finally {
                setLoading(false);
            }
        };

        if (albumId) {
            fetchAlbum();
        }
    }, [albumId]);

    const tracks = album?.musics || [];
    const isCurrentPlayingHere = tracks.some(t => t._id === currentTrack?._id) && isPlaying;

    const handlePlayAll = () => {
        if (tracks.length === 0) return;
        if (isCurrentPlayingHere) {
            togglePlay();
        } else {
            playTrack(tracks[0], tracks, 0);
        }
    };

    if (loading) {
        return (
            <div className="state-container">
                <div className="spinner" />
                <p>Loading album...</p>
            </div>
        );
    }

    if (error || !album) {
        return (
            <div className="state-container">
                <p style={{ color: '#ef4444' }}>{error || 'Album not found'}</p>
            </div>
        );
    }

    return (
        <div className="view-container">
            {/* Detail Banner */}
            <div className="detail-banner">
                <img 
                    src={album.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'} 
                    alt={album.title}
                    className="detail-cover" 
                />
                <div className="detail-info">
                    <span className="detail-type">Album</span>
                    <h1 className="detail-title">{album.title}</h1>
                    {album.description && (
                        <p className="detail-description">{album.description}</p>
                    )}
                    <div className="detail-meta">
                        <span 
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => onNavigate && onNavigate(`artist-${album.artist?._id}`)}
                        >
                            <strong>{album.artist?.username || 'Artist'}</strong>
                        </span>
                        <span className="detail-meta-dot">•</span>
                        <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar">
                <button 
                    className="action-play-big"
                    onClick={handlePlayAll}
                    disabled={tracks.length === 0}
                    title={isCurrentPlayingHere ? "Pause" : "Play Album"}
                >
                    {isCurrentPlayingHere ? (
                        <Pause size={26} fill="#000" />
                    ) : (
                        <Play size={26} fill="#000" style={{ marginLeft: 2 }} />
                    )}
                </button>
            </div>

            {/* Tracklist Table */}
            {tracks.length > 0 ? (
                <table className="track-table">
                    <thead>
                        <tr>
                            <th style={{ width: 44 }}>#</th>
                            <th>Title</th>
                            <th>Genre</th>
                            <th className="right"><Clock size={16} /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tracks.map((song, i) => (
                            <SongRow
                                key={song._id}
                                track={{ ...song, album }}
                                index={i}
                                onPlay={() => playTrack(song, tracks, i)}
                                onAddToPlaylist={onAddToPlaylist}
                                isLiked={likedSongIds.includes(song._id)}
                                onToggleLike={onToggleLike}
                            />
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="state-container">
                    <Disc size={44} />
                    <h3>No tracks in this album</h3>
                </div>
            )}
        </div>
    );
}
