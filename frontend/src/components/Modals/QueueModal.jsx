import React from 'react';
import { X, Play, Music } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function QueueModal({ onClose }) {
    const { queue, queueIndex, currentTrack, playTrack } = usePlayer();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Play Queue</h2>
                    <button className="icon-btn-round" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {currentTrack && (
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 8 }}>
                            Now Playing
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 10,
                            borderRadius: 6,
                            backgroundColor: 'rgba(29, 185, 84, 0.15)',
                            border: '1px solid rgba(29, 185, 84, 0.3)'
                        }}>
                            <img 
                                src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80'} 
                                alt={currentTrack.title}
                                style={{ width: 44, height: 44, borderRadius: 4, objectFit: 'cover' }}
                            />
                            <div>
                                <div style={{ color: 'var(--primary-green)', fontWeight: 700 }}>{currentTrack.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                                    {typeof currentTrack.artist === 'object' ? currentTrack.artist?.username : 'Artist'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Next In Queue ({queue.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                    {queue.map((track, i) => {
                        const isCurrent = i === queueIndex;
                        return (
                            <div
                                key={`${track._id || track.id}-${i}`}
                                onClick={() => playTrack(track, queue, i)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    backgroundColor: isCurrent ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    color: isCurrent ? 'var(--primary-green)' : 'var(--text-main)'
                                }}
                                onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                                onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                                <span style={{ width: 24, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{i + 1}</span>
                                <img
                                    src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80'}
                                    alt={track.title}
                                    style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover' }}
                                />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                        {track.title}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                                        {typeof track.artist === 'object' ? track.artist?.username : 'Artist'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {queue.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                            Queue is empty. Play a song or album to start!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
