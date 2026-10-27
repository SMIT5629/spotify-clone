import React, { useState } from 'react';
import { X, AlertCircle, AudioLines } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ initialMode = 'login', onClose }) {
    const { login, register } = useAuth();
    const [mode, setMode] = useState(initialMode);
    const [identifier, setIdentifier] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                await login(identifier, password);
            } else {
                await register(username, email, password, role);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                    }}>
                        <AudioLines
                            size={28}
                            strokeWidth={2.5}
                            color="#1DB954"
                        />

                        <h2 className="modal-title">
                            {mode === 'login'
                                ? 'Log in to Sunno'
                                : 'Sign up to start listening'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="icon-btn-round"
                        onClick={onClose}
                        aria-label="Close authentication modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
                    <button
                        type="button"
                        className={`sidebar-link ${mode === 'login' ? 'active' : ''}`}
                        style={{ textAlign: 'center', justifyContent: 'center' }}
                        onClick={() => { setMode('login'); setError(null); }}
                    >
                        Log in
                    </button>
                    <button
                        type="button"
                        className={`sidebar-link ${mode === 'register' ? 'active' : ''}`}
                        style={{ textAlign: 'center', justifyContent: 'center' }}
                        onClick={() => { setMode('register'); setError(null); }}
                    >
                        Sign up
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

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {mode === 'login' ? (
                        <div className="form-group">
                            <label className="form-label">Email or Username</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Email or username"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Your profile name"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="name@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Account Type</label>
                                <select
                                    className="form-input"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="user">Regular Listener</option>
                                    <option value="artist">Artist / Creator (Can upload music)</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ marginTop: 8, height: 48, fontSize: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
