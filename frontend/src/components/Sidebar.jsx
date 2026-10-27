import React from 'react';
import { Home, Search, Library, Plus, Disc, Heart, Music2 ,AudioLines} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


export default function Sidebar({ currentView, setCurrentView, playlists = [], onOpenCreatePlaylist }) {
    const { isAuthenticated, user } = useAuth();

    return (
        <aside className="sidebar">
            <div className="sidebar-box sidebar-nav">
                <a 
                    href="#home" 
                    className="sidebar-brand" 
                    onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}
                >

                   <AudioLines size={28} strokeWidth={2.5} color="#1DB954"/>
      <span> Suno</span>
                </a>

                <button 
                    className={`sidebar-link ${currentView === 'home' ? 'active' : ''}`}
                    onClick={() => setCurrentView('home')}
                >
                    <Home size={22} />
                    <span>Home</span>
                </button>

                <button 
                    className={`sidebar-link ${currentView === 'search' ? 'active' : ''}`}
                    onClick={() => setCurrentView('search')}
                >
                    <Search size={22} />
                    <span>Search</span>
                </button>
            </div>

            <div className="sidebar-box sidebar-library">
                <div className="sidebar-library-header">
                    <div 
                        className="sidebar-library-title"
                        onClick={() => setCurrentView('library')}
                    >
                        <Library size={22} />
                        <span>Your Library</span>
                    </div>

                    <button 
                        className="icon-btn-round" 
                        title="Create Playlist"
                        onClick={onOpenCreatePlaylist}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="sidebar-playlists-scroll">
                    <button 
                        className={`sidebar-link ${currentView === 'liked' ? 'active' : ''}`}
                        onClick={() => setCurrentView('liked')}
                        style={{ marginBottom: '8px' }}
                    >
                        <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                        }}>
                            <Heart size={14} fill="#fff" />
                        </div>
                        <span>Liked Songs</span>
                    </button>

                    {isAuthenticated && user?.role === 'artist' && (
                        <button 
                            className={`sidebar-link ${currentView === 'my-music' ? 'active' : ''}`}
                            onClick={() => setCurrentView('my-music')}
                            style={{ marginBottom: '8px' }}
                        >
                            <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #1DB954, #121212)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff'
                            }}>
                                <Music2 size={14} />
                            </div>
                            <span>My Music</span>
                        </button>
                    )}

                    {playlists.map((playlist) => (
                        <div 
                            key={playlist._id}
                            className={`playlist-item-card ${currentView === `playlist-${playlist._id}` ? 'active' : ''}`}
                            onClick={() => setCurrentView(`playlist-${playlist._id}`)}
                        >
                            <img 
                                src={playlist.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'} 
                                alt={playlist.title} 
                            />
                            <div className="playlist-item-info">
                                <span className="playlist-item-name">{playlist.title}</span>
                                <span className="playlist-item-meta">Playlist • {playlist.musics?.length || 0} songs</span>
                            </div>
                        </div>
                    ))}

                    {playlists.length === 0 && (
                        <div style={{ padding: '16px 8px', color: 'var(--text-sub)', fontSize: '0.85rem' }}>
                            {isAuthenticated ? 'No playlists yet. Create one!' : 'Sign in to create your library.'}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
