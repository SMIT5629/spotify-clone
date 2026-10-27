import React, { useState } from 'react';
import { X, Image } from 'lucide-react';
import { playlistApi } from '../../services/api';

const DEFAULT_COVERS = [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80'
];

export default function CreatePlaylistModal({ onClose, onCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverUrl, setCoverUrl] = useState(DEFAULT_COVERS[0]);
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const data = await playlistApi.create({
                title,
                description,
                coverUrl,
                isPublic
            });
            if (onCreated) {
                onCreated(data.playlist);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to create playlist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create Playlist</h2>
                    <button className="icon-btn-round" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Playlist Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="My playlist #1"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description (optional)</label>
                        <textarea
                            className="form-input"
                            style={{ resize: 'none', height: 72 }}
                            placeholder="Give your playlist a catchy description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Select Cover Image</label>
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                            {DEFAULT_COVERS.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`Cover ${i}`}
                                    onClick={() => setCoverUrl(img)}
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 6,
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                        border: coverUrl === img ? '2px solid var(--primary-green)' : '2px solid transparent',
                                        opacity: coverUrl === img ? 1 : 0.6
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            style={{ width: 18, height: 18, accentColor: 'var(--primary-green)' }}
                        />
                        <label htmlFor="isPublic" style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                            Make this playlist public
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ height: 48, marginTop: 8 }}
                        disabled={loading || !title.trim()}
                    >
                        {loading ? 'Creating...' : 'Save Playlist'}
                    </button>
                </form>
            </div>
        </div>
    );
}
