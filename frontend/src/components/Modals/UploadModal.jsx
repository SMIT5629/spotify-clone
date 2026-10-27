import React, { useState, useRef } from 'react';
import { X, UploadCloud, Image, Music, CheckCircle } from 'lucide-react';
import { musicApi } from '../../services/api';

export default function UploadModal({ onClose, onUploaded, albums = [] }) {
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('Pop');
    const [duration, setDuration] = useState('240');
    const [coverUrl, setCoverUrl] = useState('');
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [audioUri, setAudioUri] = useState('');
    const [file, setFile] = useState(null);
    const [albumId, setAlbumId] = useState('');
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
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('genre', genre);
            formData.append('duration', duration);
            if (albumId) formData.append('albumId', albumId);

            if (file) {
                formData.append('music', file);
            } else if (audioUri) {
                formData.append('uri', audioUri);
            } else {
                throw new Error('Please select an audio file or enter an audio stream URL');
            }

            if (coverFile) {
                formData.append('cover', coverFile);
            } else if (coverUrl) {
                formData.append('coverUrl', coverUrl);
            }

            await musicApi.uploadTrack(formData);

            if (onUploaded) onUploaded();
            onClose();
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Upload New Track</h2>
                    <button className="icon-btn-round" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Song Title</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Midnight Starlight"
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
                                placeholder="Pop, Synthwave, Rock..."
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

                    {/* Cover Page Upload */}
                    <div className="form-group">
                        <label className="form-label">Cover Page / Artwork Image</label>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div 
                                style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: 6,
                                    backgroundColor: '#282828',
                                    border: '1px dashed rgba(255, 255, 255, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                                onClick={() => coverInputRef.current?.click()}
                                title="Upload cover image"
                            >
                                {coverPreview ? (
                                    <img 
                                        src={coverPreview} 
                                        alt="Cover preview" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <Image size={24} color="var(--text-sub)" />
                                )}
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <input
                                    type="file"
                                    ref={coverInputRef}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleCoverChange}
                                />
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    style={{ padding: '6px 14px', fontSize: '0.82rem', width: 'fit-content' }}
                                    onClick={() => coverInputRef.current?.click()}
                                >
                                    {coverFile ? 'Change Cover Image' : 'Select Cover Image'}
                                </button>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>
                                    {coverFile ? coverFile.name : 'JPEG, PNG or WebP'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Audio MP3 File Upload */}
                    <div className="form-group">
                        <label className="form-label">Audio File (MP3 / WAV)</label>
                        <input
                            type="file"
                            accept="audio/*"
                            className="form-input"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </div>

                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        — Or specify streaming audio URL —
                    </div>

                    <div className="form-group">
                        <input
                            type="url"
                            className="form-input"
                            placeholder="https://.../stream.mp3"
                            value={audioUri}
                            onChange={(e) => setAudioUri(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ height: 48, marginTop: 4 }}
                        disabled={loading}
                    >
                        {loading ? 'Uploading & Processing...' : 'Publish Track'}
                    </button>
                </form>
            </div>
        </div>
    );
}
