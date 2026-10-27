import React from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function SongCard({ 
    item, 
    type = 'song', // 'song' | 'album' | 'playlist' | 'artist'
    onClick,
    onPlay
}) {
    const { currentTrack, isPlaying } = usePlayer();

    const isCurrentTrackPlaying = type === 'song' && 
        currentTrack && 
        (currentTrack._id === item._id || currentTrack.id === item._id) && 
        isPlaying;

    const title = item.title || item.username || 'Untitled';
    const subtitle = type === 'song' 
        ? (item.artist?.username || 'Artist')
        : type === 'album' 
            ? `Album • ${item.artist?.username || 'Artist'}`
            : type === 'playlist'
                ? (item.description || `By ${item.user?.username || 'User'}`)
                : 'Artist';

    const imageUrl = item.avatar || item.coverUrl || 
        (type === 'artist' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
            : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80');

    const handlePlayClick = (e) => {
        e.stopPropagation();
        if (onPlay) {
            onPlay(item);
        }
    };

    return (
        <div className="media-card" onClick={onClick}>
            <div className={`card-img-wrapper ${type === 'artist' ? 'rounded' : ''}`}>
                <img src={imageUrl} alt={title} loading="lazy" />
                <button 
                    className="card-play-btn" 
                    onClick={handlePlayClick}
                    title="Play"
                >
                    {isCurrentTrackPlaying ? (
                        <Pause size={22} fill="#000" />
                    ) : (
                        <Play size={22} fill="#000" style={{ marginLeft: 2 }} />
                    )}
                </button>
            </div>
            <div className="card-title">{title}</div>
            <div className="card-desc">{subtitle}</div>
        </div>
    );
}
