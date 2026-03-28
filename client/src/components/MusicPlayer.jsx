import { useEffect, useRef, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, X, Music, ChevronUp, ChevronDown
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const MusicPlayer = () => {
  const {
    currentSong, queue, currentIndex,
    isPlaying, setIsPlaying,
    shuffle, repeat,
    audioRef,
    playNext, playPrev,
    toggleShuffle, toggleRepeat,
    closePlayer,
  } = usePlayer();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMeta = () => setDuration(audio.duration);
    const onEnded = () => playNext();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [audioRef, playNext, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    audio.src = currentSong.audio_file;
    audio.load();
    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  if (!currentSong) return null;

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <div
        id="music-player"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(10, 14, 30, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(139, 92, 246, 0.25)',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.5)',
          transition: 'transform 0.3s ease',
          transform: collapsed ? 'translateY(calc(100% - 6px))' : 'translateY(0)',
        }}
      >
        {/* Collapse handle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          id="player-collapse-btn"
          style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10,14,30,0.92)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            padding: '2px 16px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.7rem',
          }}
        >
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Progress bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          id="player-progress-bar"
          style={{
            height: '4px',
            background: 'rgba(255,255,255,0.08)',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              transition: 'width 0.1s linear',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute',
              right: '-6px',
              top: '-4px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: 'white',
              boxShadow: '0 0 6px rgba(139,92,246,0.8)',
            }} />
          </div>
        </div>

        {/* Main controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          {/* Album art + song info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              overflow: 'hidden',
              flexShrink: 0,
              background: 'var(--surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isPlaying ? '0 0 15px rgba(139,92,246,0.5)' : 'none',
              transition: 'box-shadow 0.3s',
            }}>
              {currentSong.cover_image
                ? <img src={currentSong.cover_image} alt={currentSong.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Music size={22} style={{ color: 'var(--text-muted)' }} />
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 600,
                color: 'white',
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px',
              }}>
                {currentSong.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentSong.artist}</div>
            </div>
          </div>

          {/* Center: controls + time */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                id="player-shuffle-btn"
                title="Shuffle"
                style={{ color: shuffle ? 'var(--primary)' : 'var(--text-muted)', padding: '0.4rem' }}
              >
                <Shuffle size={18} />
              </button>

              {/* Prev */}
              <button
                onClick={playPrev}
                id="player-prev-btn"
                title="Previous"
                style={{ color: 'var(--text-muted)', padding: '0.4rem' }}
              >
                <SkipBack size={22} />
              </button>

              {/* Play / Pause */}
              <button
                id="player-playpause-btn"
                onClick={() => setIsPlaying(p => !p)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(139,92,246,0.5)',
                  flexShrink: 0,
                }}
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                id="player-next-btn"
                title="Next"
                style={{ color: 'var(--text-muted)', padding: '0.4rem' }}
              >
                <SkipForward size={22} />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                id="player-repeat-btn"
                title={`Repeat: ${repeat}`}
                style={{ color: repeat !== 'none' ? 'var(--primary)' : 'var(--text-muted)', padding: '0.4rem' }}
              >
                <RepeatIcon size={18} />
              </button>
            </div>

            {/* Time */}
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>{formatTime(progress)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
              {queue.length > 1 && (
                <span style={{ marginLeft: '0.5rem', color: 'var(--primary)', opacity: 0.8 }}>
                  {currentIndex + 1} / {queue.length}
                </span>
              )}
            </div>
          </div>

          {/* Volume + close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, justifyContent: 'flex-end' }}>
            <button
              id="player-mute-btn"
              onClick={() => setMuted(m => !m)}
              style={{ color: 'var(--text-muted)', padding: '0.4rem', flexShrink: 0 }}
            >
              {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              id="player-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={e => { setVolume(Number(e.target.value)); setMuted(false); }}
              style={{
                width: '90px',
                accentColor: 'var(--primary)',
                cursor: 'pointer',
              }}
            />
            <button
              id="player-close-btn"
              onClick={closePlayer}
              style={{ color: 'var(--text-muted)', padding: '0.4rem', flexShrink: 0 }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;
