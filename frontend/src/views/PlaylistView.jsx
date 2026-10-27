import React, { useEffect, useState } from 'react';
import { Play, Pause, Trash2, Clock, Music } from 'lucide-react';
import SongRow from '../components/SongRow';
import { playlistApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

export default function PlaylistView({ 
    playlistId, 
    onAddToPlaylist, 
    likedSongIds = [], 
    onToggleLike,
    onPlaylistUpdated
}) {
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

    const fetchPlaylist = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await playlistApi.getById(playlistId);
            setPlaylist(data.playlist);
        } catch (err) {
            setError(err.message || 'Failed to load playlist');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (playlistId) {
            fetchPlaylist();
        }
    }, [playlistId]);

    const isPlaylistOwner = playlist && user && (playlist.user?._id === user.id || playlist.user === user.id);
    const tracks = playlist?.musics || [];

    const isCurrentPlayingHere = tracks.some(t => t._id === currentTrack?._id) && isPlaying;

    const handlePlayAll = () => {
        if (tracks.length === 0) return;
        if (isCurrentPlayingHere) {
            togglePlay();
        } else {
            playTrack(tracks[0], tracks, 0);
        }
    };

    const handleRemoveSong = async (song) => {
        try {
            await playlistApi.removeSong(playlist._id, song._id);
            fetchPlaylist();
            if (onPlaylistUpdated) onPlaylistUpdated();
        } catch (err) {
            alert(err.message || 'Failed to remove song');
        }
    };

    if (loading) {
        return (
            <div className="state-container">
                <div className="spinner" />
                <p>Loading playlist...</p>
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className="state-container">
                <p style={{ color: '#ef4444' }}>{error || 'Playlist not found'}</p>
            </div>
        );
    }

    return (
        <div className="view-container">
            {/* Detail Banner */}
            <div className="detail-banner">
                <img 
                    src={playlist.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'} 
                    alt={playlist.title}
                    className="detail-cover" 
                />
                <div className="detail-info">
                    <span className="detail-type">{playlist.isPublic ? 'Public Playlist' : 'Private Playlist'}</span>
                    <h1 className="detail-title">{playlist.title}</h1>
                    {playlist.description && (
                        <p className="detail-description">{playlist.description}</p>
                    )}
                    <div className="detail-meta">
                        <span>Created by <strong>{playlist.user?.username || 'User'}</strong></span>
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
                    title={isCurrentPlayingHere ? "Pause" : "Play Playlist"}
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
                                track={song}
                                index={i}
                                onPlay={() => playTrack(song, tracks, i)}
                                onAddToPlaylist={onAddToPlaylist}
                                onRemoveFromPlaylist={isPlaylistOwner ? () => handleRemoveSong(song) : null}
                                isLiked={likedSongIds.includes(song._id)}
                                onToggleLike={onToggleLike}
                            />
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="state-container">
                    <Music size={44} />
                    <h3>This playlist is empty</h3>
                    <p>Find songs via Search or Home and add them to this playlist.</p>
                </div>
            )}
        </div>
    );
}
