import React, { useState, useRef } from 'react';
import { X, Image, Music, Save, Loader2 } from 'lucide-react';
import { musicApi } from '../../services/api';

export default function EditSongModal({ song, onClose, onUpdated }) {
    const [title, setTitle] = useState(song?.title || '');
    const [genre, setGenre] = useState(song?.genre || 'Pop');
    const [duration, setDuration] = useState(song?.duration || 240);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(song?.coverUrl || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const coverInputRef = useRef(null);

    const handleCoverChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setCoverFile(selectedFile);
            setCoverPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Song title is required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('genre', genre);
            formData.append('duration', duration);

            if (coverFile) {
                formData.append('cover', coverFile);
            }

            const res = await musicApi.updateTrack(song._id || song.id, formData);
            if (onUpdated) {
                onUpdated(res.music || { ...song, title, genre, duration, coverUrl: coverPreview });
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update song');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Edit Song Details</h2>
                    <button className="icon-btn-round" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div style={{ 
                        color: '#ef4444', 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                        padding: '10px 14px', 
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem' 
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div 
                            style={{
                                width: 90,
                                height: 90,
                                borderRadius: 8,
                                overflow: 'hidden',
                                backgroundColor: 'var(--bg-elevated)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--border-subtle)',
                                position: 'relative',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                            onClick={() => coverInputRef.current?.click()}
                            title="Click to change cover image"
                        >
                            {coverPreview ? (
                                <img 
                                    src={coverPreview} 
                                    alt="Cover preview" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            ) : (
                                <Image size={32} color="var(--text-sub)" />
                            )}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                            >
                                <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>Change</span>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleCoverChange}
                            />
                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                                onClick={() => coverInputRef.current?.click()}
                            >
                                <Image size={15} />
                                <span>Upload New Artwork</span>
                            </button>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', display: 'block', marginTop: 4 }}>
                                Recommended: 500x500 JPEG/PNG
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Song Title</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Song title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Genre</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Pop, Rock, Hip Hop..."
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Duration (seconds)</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="240"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: 16, height: 16 }} />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
