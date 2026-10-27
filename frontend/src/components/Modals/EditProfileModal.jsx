import React, { useState, useRef } from 'react';
import { X, Camera, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EditProfileModal({ onClose }) {
    const { user, updateProfile } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', username.trim());

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await updateProfile(formData);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 600);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Edit Profile</h2>
                    <button className="icon-btn-round" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid #ef4444',
                        padding: '10px 14px',
                        borderRadius: 6,
                        color: '#fca5a5',
                        fontSize: '0.85rem'
                    }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        backgroundColor: 'rgba(29, 185, 84, 0.2)',
                        border: '1px solid var(--primary-green)',
                        padding: '10px 14px',
                        borderRadius: 6,
                        color: 'var(--primary-green)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}>
                        <Check size={16} />
                        <span>Profile updated successfully!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Avatar preview & upload trigger */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div 
                            style={{
                                position: 'relative',
                                width: 110,
                                height: 110,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: '3px solid rgba(255, 255, 255, 0.2)',
                                backgroundColor: '#282828',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            title="Click to choose a photo"
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profile Avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>
                                    {username ? username.charAt(0).toUpperCase() : 'U'}
                                </span>
                            )}

                            {/* Hover overlay with camera icon */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                color: '#fff'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                            >
                                <Camera size={26} />
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 4 }}>Change</span>
                            </div>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        <button
                            type="button"
                            className="btn-secondary"
                            style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Upload Photo
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Your display name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={user?.email || ''}
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading || !username.trim()}>
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
