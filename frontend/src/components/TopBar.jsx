import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X, LogIn, LogOut, User as UserIcon, UploadCloud, Music } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ 
    currentView, 
    setCurrentView, 
    searchQuery, 
    setSearchQuery, 
    onOpenAuth,
    onOpenUpload,
    onOpenEditProfile
}) {
    const { user, isAuthenticated, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="top-bar">
            <div className="top-bar-left">
                <div className="nav-history-btns">
                    <button className="nav-btn" onClick={() => window.history.back()} title="Go back">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="nav-btn" onClick={() => window.history.forward()} title="Go forward">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {currentView === 'search' && (
                    <div className="search-bar-input-wrapper">
                        <Search size={18} className="search-bar-icon" />
                        <input 
                            type="text" 
                            className="search-bar-input"
                            placeholder="What do you want to play?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        {searchQuery && (
                            <button className="search-bar-clear" onClick={() => setSearchQuery('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="top-bar-right">
                {isAuthenticated && user?.role === 'artist' && (
                    <button 
                        className="btn-secondary" 
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
                        onClick={onOpenUpload}
                    >
                        <UploadCloud size={16} />
                        <span>Upload Song</span>
                    </button>
                )}

                {isAuthenticated ? (
                    <div style={{ position: 'relative' }}>
                        <div 
                            className="user-badge" 
                            onClick={() => setShowUserMenu(prev => !prev)}
                        >
                            <div className="user-avatar" style={{ overflow: 'hidden' }}>
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user?.username ? user.username.charAt(0).toUpperCase() : 'U'
                                )}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                {user?.username}
                            </span>
                        </div>

                        {showUserMenu && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                top: 44,
                                width: 190,
                                backgroundColor: 'var(--bg-elevated)',
                                borderRadius: 'var(--radius-md)',
                                padding: '6px',
                                boxShadow: 'var(--shadow-elevated)',
                                border: '1px solid var(--border-subtle)',
                                zIndex: 1000
                            }}>
                                <div style={{
                                    padding: '8px 12px',
                                    fontSize: '0.8rem',
                                    color: 'var(--text-sub)',
                                    borderBottom: '1px solid var(--border-subtle)'
                                }}>
                                    Signed in as <strong style={{ color: '#fff' }}>{user?.username}</strong>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-green)' }}>Role: {user?.role}</div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        onOpenEditProfile && onOpenEditProfile();
                                    }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 12px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-main)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <UserIcon size={16} />
                                    <span>Profile</span>
                                </button>

                                {user?.role === 'artist' && (
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            setCurrentView && setCurrentView('my-music');
                                        }}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '10px 12px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-main)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            borderRadius: 'var(--radius-sm)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Music size={16} color="var(--primary-green)" />
                                        <span>My Music</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        logout();
                                    }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '10px 12px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ff5c5c',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut size={16} />
                                    <span>Log out</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="btn-secondary" onClick={() => onOpenAuth('register')}>
                            Sign up
                        </button>
                        <button className="btn-primary" onClick={() => onOpenAuth('login')}>
                            Log in
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
