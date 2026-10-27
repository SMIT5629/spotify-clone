import React, { useState } from 'react';
import { X, Check, Music } from 'lucide-react';
import { playlistApi } from '../../services/api';

export default function AddToPlaylistModal({ song, playlists = [], onClose, onAdded }) {
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleAdd = async (playlistId) => {
        if (!song || !playlistId) return;
        setLoading(true);
        setError(null);

        try {
            const songId = song._id || song.id;
            await playlistApi.addSong(playlistId, songId);
            setSuccess(true);
            if (onAdded) onAdded(playlistId);
            setTimeout(() => {
                onClose();
            }, 800);
        } catch (err) {
            setError(err.message || 'Failed to add song');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Add to Playlist</h2>
                    <button className="icon-btn-round" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 6
                }}>
                    <img 
                        src={song?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80'} 
                        alt={song?.title} 
                        style={{ width: 44, height: 44, borderRadius: 4, objectFit: 'cover' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {song?.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                            {typeof song?.artist === 'object' ? song.artist?.username : 'Artist'}
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>
                )}
                {success && (
                    <div style={{ color: 'var(--primary-green)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Check size={18} /> Added to playlist!
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                    {playlists.map((pl) => (
                        <div
                            key={pl._id}
                            onClick={() => handleAdd(pl._id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 12px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                backgroundColor: 'var(--bg-highlight)',
                                transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-highlight)'}
                        >
                            <img
                                src={pl.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80'}
                                alt={pl.title}
                                style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{pl.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{pl.musics?.length || 0} tracks</div>
                            </div>
                        </div>
                    ))}

                    {playlists.length === 0 && (
                        <div style={{ color: 'var(--text-sub)', textAlign: 'center', padding: '20px 0' }}>
                            You have no playlists yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
