import React, { useRef } from 'react';
import { 
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, 
    Volume2, Volume1, VolumeX, Heart, ListMusic, AlertCircle 
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function BottomPlayer({ onToggleQueue, likedSongIds = [], onToggleLike }) {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isBuffering,
        error,
        isShuffle,
        repeatMode,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        playNext,
        playPrev,
        toggleShuffle,
        cycleRepeatMode
    } = usePlayer();

    const progressBarRef = useRef(null);

    const handleSeekClick = (e) => {
        if (!duration || !progressBarRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        seek(percentage * duration);
    };

    const handleVolumeClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        setVolume(percentage);
    };

    const isCurrentLiked = currentTrack && likedSongIds.includes(currentTrack._id);
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const currentVol = isMuted ? 0 : volume;

    return (
        <footer className="bottom-player">
            {/* Left: Current Track Info */}
            <div className="player-left">
                {currentTrack ? (
                    <>
                        <img 
                            src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'} 
                            alt={currentTrack.title}
                            className="player-track-img" 
                        />
                        <div className="player-track-info">
                            <span className="player-track-title">{currentTrack.title}</span>
                            <span className="player-track-artist">
                                {typeof currentTrack.artist === 'object' ? currentTrack.artist?.username : 'Artist'}
                            </span>
                        </div>
                        <button 
                            className="ctrl-btn" 
                            style={{ marginLeft: 6, color: isCurrentLiked ? 'var(--primary-green)' : 'var(--text-sub)' }}
                            onClick={() => onToggleLike && onToggleLike(currentTrack)}
                            title={isCurrentLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
                        >
                            <Heart size={18} fill={isCurrentLiked ? 'var(--primary-green)' : 'none'} />
                        </button>
                    </>
                ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No song selected
                    </div>
                )}
            </div>

            {/* Center: Controls & Timeline */}
            <div className="player-center">
                <div className="player-controls">
                    <button 
                        className={`ctrl-btn ${isShuffle ? 'active' : ''}`}
                        onClick={toggleShuffle}
                        title="Shuffle"
                    >
                        <Shuffle size={18} />
                    </button>

                    <button className="ctrl-btn" onClick={playPrev} title="Previous track">
                        <SkipBack size={20} />
                    </button>

                    <button 
                        className="play-pause-btn" 
                        onClick={togglePlay}
                        disabled={!currentTrack}
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isBuffering ? (
                            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                        ) : isPlaying ? (
                            <Pause size={20} fill="#000" />
                        ) : (
                            <Play size={20} fill="#000" style={{ marginLeft: 2 }} />
                        )}
                    </button>

                    <button className="ctrl-btn" onClick={playNext} title="Next track">
                        <SkipForward size={20} />
                    </button>

                    <button 
                        className={`ctrl-btn ${repeatMode !== 'off' ? 'active' : ''}`}
                        onClick={cycleRepeatMode}
                        title={`Repeat: ${repeatMode}`}
                    >
                        {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                    </button>
                </div>

                <div className="player-progress-bar">
                    <span className="progress-time">{formatTime(currentTime)}</span>
                    <div 
                        className="slider-track" 
                        ref={progressBarRef}
                        onClick={handleSeekClick}
                    >
                        <div className="slider-fill" style={{ width: `${progressPercent}%` }}>
                            <div className="slider-thumb" />
                        </div>
                    </div>
                    <span className="progress-time">{formatTime(duration)}</span>
                </div>

                {error && (
                    <div style={{
                        position: 'absolute',
                        top: -34,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: '#d32f2f',
                        color: '#fff',
                        fontSize: '0.75rem',
                        padding: '4px 12px',
                        borderRadius: 4
                    }}>
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Right: Volume & Queue */}
            <div className="player-right">
                <button className="ctrl-btn" onClick={onToggleQueue} title="Queue">
                    <ListMusic size={20} />
                </button>

                <div className="volume-wrapper">
                    <button className="ctrl-btn" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
                        {isMuted || currentVol === 0 ? (
                            <VolumeX size={18} />
                        ) : currentVol < 0.5 ? (
                            <Volume1 size={18} />
                        ) : (
                            <Volume2 size={18} />
                        )}
                    </button>

                    <div 
                        className="slider-track"
                        onClick={handleVolumeClick}
                        style={{ height: 4 }}
                    >
                        <div className="slider-fill" style={{ width: `${currentVol * 100}%` }}>
                            <div className="slider-thumb" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
