import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, Edit2, Trash2, UploadCloud, Clock, Disc, AlertCircle } from 'lucide-react';
import { musicApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

function formatDuration(sec) {
    if (!sec || isNaN(sec)) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function MyMusicView({ onOpenUpload, onEditSong }) {
    const { user } = useAuth();
    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [songToDelete, setSongToDelete] = useState(null);

    const fetchMyTracks = async () => {
        try {
            setLoading(true);
            const res = await musicApi.getMyTracks();
            setTracks(res.musics || []);
        } catch (err) {
            setError(err.message || 'Failed to load your music tracks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTracks();
    }, []);

    const handleDeleteConfirm = async () => {
        if (!songToDelete) return;
        const id = songToDelete._id || songToDelete.id;
        try {
            setDeletingId(id);
            await musicApi.deleteTrack(id);
            setTracks(prev => prev.filter(t => (t._id || t.id) !== id));
            setSongToDelete(null);
        } catch (err) {
            alert('Failed to delete track: ' + (err.message || 'Error'));
        } finally {
            setDeletingId(null);
        }
    };

    const totalPlays = tracks.reduce((acc, curr) => acc + (curr.plays || 0), 0);

    return (
        <div className="view-container">
            {/* Header Banner */}
            <div 
                className="detail-banner"
                style={{ background: 'linear-gradient(180deg, rgba(29, 185, 84, 0.45) 0%, transparent 100%)' }}
            >
                <div 
                    className="detail-cover"
                    style={{
                        background: 'linear-gradient(135deg, #1DB954 0%, #191414 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        borderRadius: 12
                    }}
                >
                    <Music size={72} />
                </div>
                <div className="detail-info">
                    <span className="detail-type">Artist Discography</span>
                    <h1 className="detail-title">My Music</h1>
                    <div className="detail-meta">
                        <span style={{ fontWeight: 700, color: '#fff' }}>{user?.username}</span>
                        <span>•</span>
                        <span>{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</span>
                        <span>•</span>
                        <span>{totalPlays.toLocaleString()} total plays</span>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    {tracks.length > 0 && (
                        <button
                            className="action-play-big"
                            onClick={() => {
                                const isCurrentPlayingHere = tracks.some(s => s._id === currentTrack?._id) && isPlaying;
                                if (isCurrentPlayingHere) {
                                    togglePlay();
                                } else {
                                    playTrack(tracks[0], tracks, 0);
                                }
                            }}
                            title="Play all tracks"
                        >
                            {tracks.some(s => s._id === currentTrack?._id) && isPlaying ? (
                                <Pause size={26} fill="#000" />
                            ) : (
                                <Play size={26} fill="#000" style={{ marginLeft: 2 }} />
                            )}
                        </button>
                    )}
                </div>

                <button
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 500 }}
                    onClick={onOpenUpload}
                >
                    <UploadCloud size={18} />
                    <span>Upload New Song</span>
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ 
                    padding: '12px 16px', 
                    backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                    color: '#ef4444', 
                    borderRadius: 8, 
                    marginBottom: 20 
                }}>
                    {error}
                </div>
            )}

            {/* Tracks List */}
            {loading ? (
                <div className="state-container" style={{ padding: '60px 0' }}>
                    <div className="spinner" />
                    <p style={{ marginTop: 12 }}>Loading your tracks...</p>
                </div>
            ) : tracks.length > 0 ? (
                <table className="track-table">
                    <thead>
                        <tr>
                            <th style={{ width: 44 }}>#</th>
                            <th>Title</th>
                            <th>Genre</th>
                            <th>Plays</th>
                            <th className="right"><Clock size={16} /></th>
                            <th className="right" style={{ width: 140 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tracks.map((track, i) => {
                            const isCurrent = currentTrack && (currentTrack._id === track._id || currentTrack.id === track._id);
                            const isThisPlaying = isCurrent && isPlaying;

                            return (
                                <tr key={track._id} className={`track-row ${isCurrent ? 'playing' : ''}`}>
                                    <td className="track-num-cell" onClick={() => playTrack(track, tracks, i)}>
                                        <span className="track-num">{i + 1}</span>
                                        <span className="track-play-icon">
                                            {isThisPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                        </span>
                                    </td>

                                    <td onClick={() => playTrack(track, tracks, i)}>
                                        <div className="track-main-cell">
                                            <img 
                                                src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80'} 
                                                alt={track.title} 
                                            />
                                            <div className="track-details">
                                                <span className="track-title">{track.title}</span>
                                                <span className="track-artist">{track.artist?.username || user?.username}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span style={{ 
                                            backgroundColor: 'rgba(255,255,255,0.08)', 
                                            padding: '4px 10px', 
                                            borderRadius: 20, 
                                            fontSize: '0.75rem',
                                            color: 'var(--text-sub)'
                                        }}>
                                            {track.genre || 'Pop'}
                                        </span>
                                    </td>

                                    <td>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                                            {(track.plays || 0).toLocaleString()}
                                        </span>
                                    </td>

                                    <td className="right">
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                                            {formatDuration(track.duration)}
                                        </span>
                                    </td>

                                    <td className="right">
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                            <button
                                                className="icon-btn-round"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditSong && onEditSong(track);
                                                }}
                                                title="Edit Song"
                                                style={{ color: 'var(--text-main)' }}
                                            >
                                                <Edit2 size={16} />
                                            </button>

                                            <button
                                                className="icon-btn-round"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSongToDelete(track);
                                                }}
                                                title="Delete Song"
                                                style={{ color: '#ff6b6b' }}
                                                disabled={deletingId === track._id}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <div className="state-container" style={{ padding: '60px 0' }}>
                    <Disc size={48} />
                    <h3>You haven't uploaded any songs yet</h3>
                    <p>Share your music with the world by uploading your first audio track.</p>
                    <button 
                        className="btn-primary" 
                        style={{ marginTop: 16 }}
                        onClick={onOpenUpload}
                    >
                        Upload Song
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {songToDelete && (
                <div className="modal-overlay" onClick={() => setSongToDelete(null)}>
                    <div className="modal-card" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ef4444',
                                flexShrink: 0
                            }}>
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>
                                    Delete Song?
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                                    Are you sure you want to delete <strong style={{ color: '#fff' }}>"{songToDelete.title}"</strong>? 
                                    This will permanently remove the song, audio, and all user saves. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setSongToDelete(null)}
                                disabled={deletingId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                style={{
                                    backgroundColor: '#ef4444',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 18px',
                                    borderRadius: 500,
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                                onClick={handleDeleteConfirm}
                                disabled={deletingId !== null}
                            >
                                {deletingId ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
