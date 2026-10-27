import React from 'react';
import { Play, Pause, Heart, Plus, Trash2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatDuration(sec) {
    if (!sec || isNaN(sec)) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function SongRow({ 
    track, 
    index, 
    onPlay, 
    onAddToPlaylist, 
    onRemoveFromPlaylist,
    isLiked = false,
    onToggleLike
}) {
    const { currentTrack, isPlaying } = usePlayer();

    const isThisTrackPlaying = currentTrack && 
        (currentTrack._id === track._id || currentTrack.id === track._id) && 
        isPlaying;

    const isCurrent = currentTrack && (currentTrack._id === track._id || currentTrack.id === track._id);

    return (
        <tr className={`track-row ${isCurrent ? 'playing' : ''}`} onClick={() => onPlay(track)}>
            <td className="track-num-cell">
                <span className="track-num">{index + 1}</span>
                <span className="track-play-icon">
                    {isThisTrackPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                </span>
            </td>

            <td>
                <div className="track-main-cell">
                    <img 
                        src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80'} 
                        alt={track.title} 
                    />
                    <div className="track-details">
                        <span className="track-title">{track.title}</span>
                        <span className="track-artist">
                            {typeof track.artist === 'object' ? track.artist?.username : 'Artist'}
                        </span>
                    </div>
                </div>
            </td>

            <td>
                {typeof track.album === 'object' ? track.album?.title : (track.genre || 'Single')}
            </td>

            <td className="right">
                <div className="track-actions">
                    <button 
                        className="icon-btn-round" 
                        style={{ color: isLiked ? 'var(--primary-green)' : 'var(--text-sub)' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleLike && onToggleLike(track);
                        }}
                        title={isLiked ? "Unlike" : "Like"}
                    >
                        <Heart size={16} fill={isLiked ? 'var(--primary-green)' : 'none'} />
                    </button>

                    {onAddToPlaylist && (
                        <button 
                            className="icon-btn-round" 
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToPlaylist(track);
                            }}
                            title="Add to playlist"
                        >
                            <Plus size={16} />
                        </button>
                    )}

                    {onRemoveFromPlaylist && (
                        <button 
                            className="icon-btn-round" 
                            style={{ color: '#ff6b6b' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFromPlaylist(track);
                            }}
                            title="Remove from playlist"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}

                    <span style={{ fontSize: '0.8rem', minWidth: 36, textAlign: 'right' }}>
                        {formatDuration(track.duration)}
                    </span>
                </div>
            </td>
        </tr>
    );
}
