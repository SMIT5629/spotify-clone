import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
    const audioRef = useRef(new Audio());
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [error, setError] = useState(null);

    // Queue & Modes
    const [queue, setQueue] = useState([]);
    const [queueIndex, setQueueIndex] = useState(-1);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
    const [playbackHistory, setPlaybackHistory] = useState([]);

    // Initialize audio listeners
    useEffect(() => {
        const audio = audioRef.current;
        audio.preload = 'metadata';

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoadedMetadata = () => {
            setDuration(audio.duration || 0);
            setIsBuffering(false);
        };
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => setIsBuffering(false);
        const onError = (e) => {
            console.error('Audio playback error:', e);
            setIsBuffering(false);
            setIsPlaying(false);
            setError('Unable to stream this audio track. Check network or source.');
        };
        const onEnded = () => {
            handleTrackEnded();
        };

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('playing', onPlaying);
        audio.addEventListener('error', onError);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('waiting', onWaiting);
            audio.removeEventListener('playing', onPlaying);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('ended', onEnded);
        };
    }, []);

    // Sync volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const playTrack = (track, newQueue = null, indexInQueue = -1) => {
        if (!track || !track.uri) {
            setError('Invalid track URL');
            return;
        }

        setError(null);
        setCurrentTrack(track);

        if (newQueue) {
            setQueue(newQueue);
            const idx = indexInQueue >= 0 ? indexInQueue : newQueue.findIndex(t => (t._id || t.id) === (track._id || track.id));
            setQueueIndex(idx >= 0 ? idx : 0);
        } else if (queue.length === 0) {
            setQueue([track]);
            setQueueIndex(0);
        }

        // Add to history
        setPlaybackHistory(prev => {
            const filtered = prev.filter(t => (t._id || t.id) !== (track._id || track.id));
            return [track, ...filtered].slice(0, 10);
        });

        const audio = audioRef.current;
        if (audio.src !== track.uri) {
            audio.src = track.uri;
            audio.load();
        }

        audio.play().catch(err => {
            console.warn('Autoplay prevented or playback interrupted:', err);
            setIsPlaying(false);
        });
    };

    const togglePlay = () => {
        if (!currentTrack) {
            if (queue.length > 0) {
                playTrack(queue[0], queue, 0);
            }
            return;
        }

        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(err => console.warn('Play error:', err));
        }
    };

    const seek = (time) => {
        const audio = audioRef.current;
        if (audio && !isNaN(time)) {
            audio.currentTime = time;
            setCurrentTime(time);
        }
    };

    const setPlayerVolume = (vol) => {
        const clamped = Math.max(0, Math.min(1, vol));
        setVolume(clamped);
        if (clamped > 0 && isMuted) {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    const playNext = () => {
        if (queue.length === 0) return;

        let nextIdx;
        if (isShuffle) {
            nextIdx = Math.floor(Math.random() * queue.length);
        } else {
            nextIdx = queueIndex + 1;
            if (nextIdx >= queue.length) {
                if (repeatMode === 'all') {
                    nextIdx = 0;
                } else {
                    return; // End of queue
                }
            }
        }

        const nextTrack = queue[nextIdx];
        if (nextTrack) {
            setQueueIndex(nextIdx);
            playTrack(nextTrack);
        }
    };

    const playPrev = () => {
        const audio = audioRef.current;
        // If current song is > 3 seconds in, restart the song first
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        if (queue.length === 0) return;

        let prevIdx = queueIndex - 1;
        if (prevIdx < 0) {
            prevIdx = queue.length - 1;
        }

        const prevTrack = queue[prevIdx];
        if (prevTrack) {
            setQueueIndex(prevIdx);
            playTrack(prevTrack);
        }
    };

    const handleTrackEnded = () => {
        if (repeatMode === 'one') {
            const audio = audioRef.current;
            audio.currentTime = 0;
            audio.play().catch(console.error);
        } else {
            playNext();
        }
    };

    const toggleShuffle = () => {
        setIsShuffle(prev => !prev);
    };

    const cycleRepeatMode = () => {
        setRepeatMode(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    };

    const addToQueue = (track) => {
        setQueue(prev => [...prev, track]);
    };

    return (
        <PlayerContext.Provider value={{
            currentTrack,
            isPlaying,
            currentTime,
            duration,
            volume,
            isMuted,
            isBuffering,
            error,
            queue,
            queueIndex,
            isShuffle,
            repeatMode,
            playbackHistory,
            playTrack,
            togglePlay,
            seek,
            setVolume: setPlayerVolume,
            toggleMute,
            playNext,
            playPrev,
            toggleShuffle,
            cycleRepeatMode,
            addToQueue
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    return useContext(PlayerContext);
}
