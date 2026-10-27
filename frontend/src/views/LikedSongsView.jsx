import React from 'react';
import { Heart, Play, Pause, Clock, Music } from 'lucide-react';
import SongRow from '../components/SongRow';
import { usePlayer } from '../context/PlayerContext';

export default function LikedSongsView({ 
    likedSongs = [], 
    onAddToPlaylist, 
    onToggleLike 
}) {
    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

    const isCurrentPlayingHere = likedSongs.some(s => s._id === currentTrack?._id) && isPlaying;

    const handlePlayAll = () => {
        if (likedSongs.length === 0) return;
        if (isCurrentPlayingHere) {
            togglePlay();
        } else {
            playTrack(likedSongs[0], likedSongs, 0);
        }
    };

    return (
        <div className="view-container">
            {/* Detail Banner */}
            <div 
                className="detail-banner"
                style={{ background: 'linear-gradient(180deg, rgba(69, 10, 245, 0.6) 0%, transparent 100%)' }}
            >
                <div 
                    className="detail-cover" 
                    style={{
                        background: 'linear-gradient(135deg, #450af5 0%, #c4efd9 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff'
                    }}
                >
                    <Heart size={80} fill="#fff" />
                </div>
                <div className="detail-info">
                    <span className="detail-type">Playlist</span>
                    <h1 className="detail-title">Liked Songs</h1>
                    <div className="detail-meta">
                        <span>{likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}</span>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar">
                <button 
                    className="action-play-big"
                    onClick={handlePlayAll}
                    disabled={likedSongs.length === 0}
                    title={isCurrentPlayingHere ? "Pause" : "Play Liked Songs"}
                >
                    {isCurrentPlayingHere ? (
                        <Pause size={26} fill="#000" />
                    ) : (
                        <Play size={26} fill="#000" style={{ marginLeft: 2 }} />
                    )}
                </button>
            </div>

            {/* Tracklist Table */}
            {likedSongs.length > 0 ? (
                <table className="track-table">
                    <thead>
                        <tr>
                            <th style={{ width: 44 }}>#</th>
                            <th>Title</th>
                            <th>Album / Genre</th>
                            <th className="right"><Clock size={16} /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {likedSongs.map((song, i) => (
                            <SongRow
                                key={song._id}
                                track={song}
                                index={i}
                                onPlay={() => playTrack(song, likedSongs, i)}
                                onAddToPlaylist={onAddToPlaylist}
                                isLiked={true}
                                onToggleLike={onToggleLike}
                            />
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="state-container">
                    <Heart size={48} />
                    <h3>Songs you like will appear here</h3>
                    <p>Save songs by clicking the heart icon while exploring.</p>
                </div>
            )}
        </div>
    );
}
