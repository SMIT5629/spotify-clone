import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import BottomPlayer from './components/BottomPlayer';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import LibraryView from './views/LibraryView';
import LikedSongsView from './views/LikedSongsView';
import PlaylistView from './views/PlaylistView';
import AlbumView from './views/AlbumView';
import ArtistView from './views/ArtistView';
import MyMusicView from './views/MyMusicView';

import AuthModal from './components/Modals/AuthModal';
import CreatePlaylistModal from './components/Modals/CreatePlaylistModal';
import AddToPlaylistModal from './components/Modals/AddToPlaylistModal';
import UploadModal from './components/Modals/UploadModal';
import QueueModal from './components/Modals/QueueModal';
import EditProfileModal from './components/Modals/EditProfileModal';
import EditSongModal from './components/Modals/EditSongModal';

import { musicApi, playlistApi } from './services/api';
import { useAuth } from './context/AuthContext';
import { usePlayer } from './context/PlayerContext';

export default function App() {
    const { isAuthenticated, user } = useAuth();
    const { playTrack } = usePlayer();

    // Navigation View State
    const [currentView, setCurrentView] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');

    // Backend Data
    const [songs, setSongs] = useState([]);
    const [featuredSongs, setFeaturedSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Liked Songs (User-specific)
    const [likedSongs, setLikedSongs] = useState([]);

    // Modals
    const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
    const [songForPlaylist, setSongForPlaylist] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showQueueModal, setShowQueueModal] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showEditSongModal, setShowEditSongModal] = useState(false);
    const [songToEdit, setSongToEdit] = useState(null);

    // Fetch initial catalog data
    const refreshData = async () => {
        try {
            const [songsRes, featRes, albumsRes, artistsRes, playlistsRes] = await Promise.all([
                musicApi.getAll().catch(() => ({ musics: [] })),
                musicApi.getFeatured().catch(() => ({ musics: [] })),
                musicApi.getAlbums().catch(() => ({ albums: [] })),
                musicApi.getArtists().catch(() => ({ artists: [] })),
                playlistApi.getAll().catch(() => ({ playlists: [] }))
            ]);

            setSongs(songsRes.musics || []);
            setFeaturedSongs(featRes.musics || songsRes.musics?.slice(0, 8) || []);
            setAlbums(albumsRes.albums || []);
            setArtists(artistsRes.artists || []);
            setPlaylists(playlistsRes.playlists || []);
        } catch (err) {
            console.error('Data load error:', err);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [isAuthenticated]);

    // Fetch user-specific liked songs
    useEffect(() => {
        try {
            localStorage.removeItem('spotify_liked_songs');
        } catch (e) {}

        if (isAuthenticated && user) {
            musicApi.getLikedSongs()
                .then((res) => {
                    setLikedSongs(res.songs || []);
                })
                .catch((err) => {
                    console.error('Failed to load liked songs:', err);
                    setLikedSongs([]);
                });
        } else {
            setLikedSongs([]);
        }
    }, [isAuthenticated, user?.id, user?._id]);

    // Handle Likes (User-specific backend sync)
    const toggleLike = async (song) => {
        if (!isAuthenticated) {
            setAuthModal('login');
            return;
        }

        const songId = song._id || song.id;
        const exists = likedSongs.some((s) => (s._id || s.id) === songId);

        // Optimistic update
        if (exists) {
            setLikedSongs((prev) => prev.filter((s) => (s._id || s.id) !== songId));
        } else {
            setLikedSongs((prev) => [song, ...prev]);
        }

        try {
            const res = await musicApi.toggleLike(songId);
            if (res.isLiked && exists) {
                // Already liked
            } else if (!res.isLiked && !exists) {
                // Already removed
            }
        } catch (err) {
            console.error('Failed to toggle like on server:', err);
            // Revert on failure
            if (exists) {
                setLikedSongs((prev) => [song, ...prev]);
            } else {
                setLikedSongs((prev) => prev.filter((s) => (s._id || s.id) !== songId));
            }
        }
    };

    const likedSongIds = likedSongs.map((s) => s._id || s.id);

    // Navigation Helpers
    const navigateTo = (view) => {
        setCurrentView(view);
    };

    const handleOpenCreatePlaylist = () => {
        if (!isAuthenticated) {
            setAuthModal('login');
            return;
        }
        setShowCreatePlaylist(true);
    };

    const handleOpenAddToPlaylist = (song) => {
        if (!isAuthenticated) {
            setAuthModal('login');
            return;
        }
        setSongForPlaylist(song);
    };

    // Render active view
    const renderView = () => {
        if (loadingData) {
            return (
                <div className="state-container" style={{ height: '100%' }}>
                    <div className="spinner" />
                    <p style={{ marginTop: 12 }}>Loading your music experience...</p>
                </div>
            );
        }

        if (currentView === 'home') {
            return (
                <HomeView
                    featuredSongs={featuredSongs}
                    albums={albums}
                    artists={artists}
                    playlists={playlists}
                    onNavigate={navigateTo}
                    onAddToPlaylist={handleOpenAddToPlaylist}
                />
            );
        }

        if (currentView === 'search') {
            return (
                <SearchView
                    songs={songs}
                    albums={albums}
                    artists={artists}
                    searchQuery={searchQuery}
                    onNavigate={navigateTo}
                    onAddToPlaylist={handleOpenAddToPlaylist}
                    likedSongIds={likedSongIds}
                    onToggleLike={toggleLike}
                />
            );
        }

        if (currentView === 'library') {
            return (
                <LibraryView
                    playlists={playlists}
                    albums={albums}
                    likedSongs={likedSongs}
                    onNavigate={navigateTo}
                    onOpenCreatePlaylist={handleOpenCreatePlaylist}
                    onOpenAuth={(mode) => setAuthModal(mode)}
                />
            );
        }

        if (currentView === 'liked') {
            return (
                <LikedSongsView
                    likedSongs={likedSongs}
                    onAddToPlaylist={handleOpenAddToPlaylist}
                    onToggleLike={toggleLike}
                />
            );
        }

        if (currentView.startsWith('playlist-')) {
            const pId = currentView.replace('playlist-', '');
            return (
                <PlaylistView
                    playlistId={pId}
                    onAddToPlaylist={handleOpenAddToPlaylist}
                    likedSongIds={likedSongIds}
                    onToggleLike={toggleLike}
                    onPlaylistUpdated={refreshData}
                />
            );
        }

        if (currentView.startsWith('album-')) {
            const aId = currentView.replace('album-', '');
            return (
                <AlbumView
                    albumId={aId}
                    onNavigate={navigateTo}
                    onAddToPlaylist={handleOpenAddToPlaylist}
                    likedSongIds={likedSongIds}
                    onToggleLike={toggleLike}
                />
            );
        }

        if (currentView.startsWith('artist-')) {
            const artId = currentView.replace('artist-', '');
            return (
                <ArtistView
                    artistId={artId}
                    onNavigate={navigateTo}
                    onAddToPlaylist={handleOpenAddToPlaylist}
                    likedSongIds={likedSongIds}
                    onToggleLike={toggleLike}
                />
            );
        }

        if (currentView === 'my-music') {
            return (
                <MyMusicView
                    onOpenUpload={() => setShowUploadModal(true)}
                    onEditSong={(song) => {
                        setSongToEdit(song);
                        setShowEditSongModal(true);
                    }}
                />
            );
        }

        return <HomeView featuredSongs={featuredSongs} albums={albums} artists={artists} playlists={playlists} onNavigate={navigateTo} />;
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="app-layout">
                {/* Left Sidebar */}
                <Sidebar
                    currentView={currentView}
                    setCurrentView={navigateTo}
                    playlists={playlists}
                    onOpenCreatePlaylist={handleOpenCreatePlaylist}
                />

                {/* Center Main Stage */}
                <main className="main-content">
                    <TopBar
                        currentView={currentView}
                        setCurrentView={navigateTo}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onOpenAuth={(mode) => setAuthModal(mode)}
                        onOpenUpload={() => setShowUploadModal(true)}
                        onOpenEditProfile={() => setShowEditProfile(true)}
                    />
                    {renderView()}
                </main>
            </div>

            {/* Persistent Bottom Music Player */}
            <BottomPlayer
                onToggleQueue={() => setShowQueueModal(prev => !prev)}
                likedSongIds={likedSongIds}
                onToggleLike={toggleLike}
            />

            {/* Modals */}
            {authModal && (
                <AuthModal
                    initialMode={authModal}
                    onClose={() => setAuthModal(null)}
                />
            )}

            {showCreatePlaylist && (
                <CreatePlaylistModal
                    onClose={() => setShowCreatePlaylist(false)}
                    onCreated={(newPlaylist) => {
                        refreshData();
                        navigateTo(`playlist-${newPlaylist._id}`);
                    }}
                />
            )}

            {songForPlaylist && (
                <AddToPlaylistModal
                    song={songForPlaylist}
                    playlists={playlists}
                    onClose={() => setSongForPlaylist(null)}
                    onAdded={() => refreshData()}
                />
            )}

            {showUploadModal && (
                <UploadModal
                    albums={albums}
                    onClose={() => setShowUploadModal(false)}
                    onUploaded={() => refreshData()}
                />
            )}

            {showQueueModal && (
                <QueueModal
                    onClose={() => setShowQueueModal(false)}
                />
            )}

            {showEditProfile && (
                <EditProfileModal
                    onClose={() => setShowEditProfile(false)}
                />
            )}

            {showEditSongModal && songToEdit && (
                <EditSongModal
                    song={songToEdit}
                    onClose={() => {
                        setShowEditSongModal(false);
                        setSongToEdit(null);
                    }}
                    onUpdated={() => {
                        refreshData();
                    }}
                />
            )}
        </div>
    );
}
