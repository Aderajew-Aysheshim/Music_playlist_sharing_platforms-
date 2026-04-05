import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  X,
  Music,
  ChevronUp,
  ChevronDown,
  FileText,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

const SEEK_STEP_SECONDS = 2;
const SEEK_HOLD_DELAY = 220;
const SEEK_REPEAT_MS = 120;

const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    shuffle,
    repeat,
    audioRef,
    playNext,
    playPrev,
    toggleShuffle,
    toggleRepeat,
    closePlayer,
  } = usePlayer();

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsTab, setLyricsTab] = useState("normal");
  const [scrubValue, setScrubValue] = useState(null);

  const lyricsContainerRef = useRef(null);
  const seekTimeoutRef = useRef(null);
  const seekIntervalRef = useRef(null);
  const suppressSeekClickRef = useRef(false);
  const holdTriggeredRef = useRef(false);
  const isScrubbingRef = useRef(false);

  const syncedLines = useMemo(() => {
    if (!currentSong?.synced_lyrics) {
      return [];
    }

    return currentSong.synced_lyrics
      .replace(/\\n/g, "\n")
      .split(/\r?\n/)
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const match = trimmed.match(/\[(\d+):(\d+(\.\d+)?)\](.*)/);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseFloat(match[2]);
          return { time: minutes * 60 + seconds, text: match[4].trim() };
        }

        return { time: 0, text: trimmed };
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time);
  }, [currentSong]);

  useEffect(() => {
    setLyricsTab(syncedLines.length > 0 ? "practice" : "normal");
    setShowLyrics(false);
  }, [syncedLines]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncDuration = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(nextDuration);
    };

    const onTimeUpdate = () => {
      if (!isScrubbingRef.current) {
        setProgress(audio.currentTime);
      }
    };

    const onLoadedMeta = () => {
      syncDuration();
      if (!isScrubbingRef.current) {
        setProgress(audio.currentTime || 0);
      }
    };

    const onDurationChange = () => syncDuration();
    const onEnded = () => playNext();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [audioRef, playNext, setIsPlaying, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const playbackUrl = currentSong.playbackUrl || currentSong.audio_file;
    if (!playbackUrl) {
      setIsPlaying(false);
      return;
    }

    if (audio.src !== playbackUrl) {
      audio.src = playbackUrl;
      audio.load();
      setProgress(0);
      setDuration(0);
      setScrubValue(null);
      isScrubbingRef.current = false;
    }

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [audioRef, currentSong, isPlaying, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = muted ? 0 : volume;
    }
  }, [audioRef, volume, muted]);

  const clearSeekTimers = () => {
    if (seekTimeoutRef.current) {
      window.clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = null;
    }

    if (seekIntervalRef.current) {
      window.clearInterval(seekIntervalRef.current);
      seekIntervalRef.current = null;
    }
  };

  const effectiveDuration = useMemo(() => {
    const audioDuration = audioRef.current?.duration;
    if (Number.isFinite(duration) && duration > 0) {
      return duration;
    }

    if (Number.isFinite(audioDuration) && audioDuration > 0) {
      return audioDuration;
    }

    return 0;
  }, [audioRef, currentSong, duration]);

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) {
      return "0:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const seekBy = (direction) => {
    const audio = audioRef.current;
    if (!audio) return;

    const limit = effectiveDuration || audio.duration || 0;
    const nextTime = Math.max(
      0,
      Math.min(audio.currentTime + direction * SEEK_STEP_SECONDS, limit),
    );

    audio.currentTime = nextTime;
    setProgress(nextTime);
  };

  const startSeekHold = (direction) => {
    clearSeekTimers();
    holdTriggeredRef.current = false;

    seekTimeoutRef.current = window.setTimeout(() => {
      holdTriggeredRef.current = true;
      suppressSeekClickRef.current = true;
      seekBy(direction);
      seekIntervalRef.current = window.setInterval(() => {
        seekBy(direction);
      }, SEEK_REPEAT_MS);
    }, SEEK_HOLD_DELAY);
  };

  const finishSeekInteraction = (fallbackAction) => {
    const didHold = holdTriggeredRef.current;
    clearSeekTimers();
    holdTriggeredRef.current = false;

    if (!didHold) {
      fallbackAction();
      return;
    }

    window.setTimeout(() => {
      suppressSeekClickRef.current = false;
    }, 0);
  };

  const cancelSeekInteraction = () => {
    const didHold = holdTriggeredRef.current;
    clearSeekTimers();
    holdTriggeredRef.current = false;

    if (didHold) {
      window.setTimeout(() => {
        suppressSeekClickRef.current = false;
      }, 0);
    }
  };

  const buildSeekHandlers = (direction, fallbackAction) => ({
    onPointerDown: () => startSeekHold(direction),
    onPointerUp: () => finishSeekInteraction(fallbackAction),
    onPointerLeave: cancelSeekInteraction,
    onPointerCancel: cancelSeekInteraction,
    onClick: (event) => {
      if (suppressSeekClickRef.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fallbackAction();
      }
    },
  });

  const beginScrub = () => {
    if (!effectiveDuration) {
      return;
    }

    isScrubbingRef.current = true;
    setScrubValue(Math.min(progress, effectiveDuration));
  };

  const handleProgressScrub = (event) => {
    const audio = audioRef.current;
    if (!audio || !effectiveDuration) {
      return;
    }

    const nextTime = Math.max(
      0,
      Math.min(Number(event.target.value), effectiveDuration),
    );

    isScrubbingRef.current = true;
    setScrubValue(nextTime);
    setProgress(nextTime);
    audio.currentTime = nextTime;
  };

  const endScrub = () => {
    isScrubbingRef.current = false;
    setScrubValue(null);
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const nextValue = !prev;
      if (nextValue) {
        setShowLyrics(false);
      }
      return nextValue;
    });
  };

  useEffect(() => {
    if (
      !showLyrics ||
      lyricsTab !== "practice" ||
      syncedLines.length === 0 ||
      !lyricsContainerRef.current
    ) {
      return;
    }

    const activeIndex = syncedLines.findIndex(
      (line, index) =>
        progress >= line.time &&
        (index === syncedLines.length - 1 || progress < syncedLines[index + 1].time),
    );

    if (activeIndex < 0) {
      return;
    }

    const activeLine = lyricsContainerRef.current.querySelector(
      `[data-lyrics-index="${activeIndex}"]`,
    );

    activeLine?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [lyricsTab, progress, showLyrics, syncedLines]);

  useEffect(
    () => () => {
      clearSeekTimers();
      isScrubbingRef.current = false;
    },
    [],
  );

  if (!currentSong) return null;

  const displayedProgress =
    scrubValue ?? Math.min(progress, effectiveDuration || progress || 0);
  const progressPercent = effectiveDuration
    ? Math.min((Math.max(progress, 0) / effectiveDuration) * 100, 100)
    : 0;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      {showLyrics && (currentSong.lyrics || syncedLines.length > 0) && (
        <div
          id="lyrics-overlay"
          className="glass-panel lyrics-overlay"
          style={{
            position: "fixed",
            bottom: "100px",
            right: "2.5%",
            width: "95%",
            maxWidth: "500px",
            maxHeight: "550px",
            zIndex: 101,
            padding: "2rem",
            borderRadius: "32px",
            animation: "fadeInUp 0.3s ease forwards",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              {currentSong.lyrics && (
                <button
                  onClick={() => setLyricsTab("normal")}
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color:
                      lyricsTab === "normal" ? "var(--primary)" : "var(--text-muted)",
                    borderBottom:
                      lyricsTab === "normal" ? "2px solid var(--primary)" : "none",
                    paddingBottom: "4px",
                  }}
                >
                  Full Text
                </button>
              )}
              {syncedLines.length > 0 && (
                <button
                  onClick={() => setLyricsTab("practice")}
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color:
                      lyricsTab === "practice"
                        ? "var(--secondary)"
                        : "var(--text-muted)",
                    borderBottom:
                      lyricsTab === "practice"
                        ? "2px solid var(--secondary)"
                        : "none",
                    paddingBottom: "4px",
                  }}
                >
                  Practice mode
                </button>
              )}
            </div>
            <button
              onClick={() => setShowLyrics(false)}
              style={{ color: "var(--text-muted)" }}
            >
              <X size={24} />
            </button>
          </div>

          <div
            ref={lyricsContainerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: "0.5rem",
              maskImage:
                "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
            }}
          >
            {lyricsTab === "normal" ? (
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "2",
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "1.1rem",
                  textAlign: "center",
                  padding: "1rem 0",
                }}
              >
                {currentSong.lyrics}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  textAlign: "center",
                  padding: "15rem 0",
                }}
              >
                {syncedLines.map((line, index) => {
                  const isCurrent =
                    progress >= line.time &&
                    (index === syncedLines.length - 1 ||
                      progress < syncedLines[index + 1].time);

                  return (
                    <div
                      key={`${line.time}-${index}`}
                      data-lyrics-index={index}
                      style={{
                        fontSize: isCurrent ? "2.1rem" : "1.3rem",
                        fontWeight: isCurrent ? 800 : 400,
                        color: isCurrent
                          ? "var(--secondary)"
                          : "rgba(255,255,255,0.25)",
                        transition:
                          "all 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
                        filter: isCurrent
                          ? "drop-shadow(0 0 15px rgba(236,72,153,0.6))"
                          : "none",
                        lineHeight: "1.4",
                        transform: isCurrent ? "scale(1.15)" : "scale(1)",
                        opacity: isCurrent ? 1 : 0.6,
                      }}
                    >
                      {line.text}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        id="music-player"
        className={`music-player-shell${collapsed ? " is-collapsed" : ""}`}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(10, 14, 30, 0.96)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          borderTop: "1px solid rgba(139, 92, 246, 0.3)",
          boxShadow: "0 -10px 50px rgba(0,0,0,0.7)",
        }}
      >
        <div className="music-player-mini">
          <div className="music-player-mini-main">
            <div className="music-player-mini-art">
              {currentSong.coverImageUrl ? (
                <img
                  src={currentSong.coverImageUrl}
                  alt={`${currentSong.title} cover`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="music-player-mini-art-fallback">
                  <Music size={20} />
                </div>
              )}
            </div>
            <div className="music-player-mini-copy">
              <strong>{currentSong.title}</strong>
              <span>
                {currentSong.artist} • {formatTime(progress)} / {formatTime(effectiveDuration)}
              </span>
            </div>
          </div>

          <div className="music-player-mini-actions">
            <button
              className="icon-button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause playback" : "Play song"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              className="icon-button"
              onClick={toggleCollapsed}
              aria-label="Expand player"
            >
              <ChevronUp size={18} />
            </button>
            <button
              className="icon-button"
              onClick={closePlayer}
              aria-label="Close player"
            >
              <X size={18} />
            </button>
          </div>

          <div
            className="music-player-mini-progress"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="music-player-expanded">
          <button className="music-player-collapse" onClick={toggleCollapsed}>
            <ChevronDown size={16} />
          </button>

          <div className="music-player-progress-wrap">
            <input
              className="music-player-progress-slider"
              type="range"
              min="0"
              max={effectiveDuration || 0.1}
              step="0.1"
              value={effectiveDuration ? displayedProgress : 0}
              onPointerDown={beginScrub}
              onInput={handleProgressScrub}
              onChange={handleProgressScrub}
              onPointerUp={endScrub}
              onPointerCancel={endScrub}
              onBlur={endScrub}
              disabled={!effectiveDuration}
              aria-label="Seek through current song"
            />
          </div>

          <div className="music-player-body">
            <div className="music-player-meta">
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#1a1a1a",
                  border: isPlaying
                    ? "1px solid var(--primary)"
                    : "1px solid transparent",
                  transition: "border 0.3s",
                }}
              >
                {currentSong.coverImageUrl ? (
                  <img
                    src={currentSong.coverImageUrl}
                    alt={`${currentSong.title} cover`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Music size={24} />
                  </div>
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    color: "white",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentSong.title}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {currentSong.artist}
                </div>
              </div>
            </div>

            <div className="music-player-center">
              <div className="music-player-controls">
                <button
                  onClick={toggleShuffle}
                  style={{ color: shuffle ? "var(--primary)" : "var(--text-muted)" }}
                >
                  <Shuffle size={20} />
                </button>
                <button
                  {...buildSeekHandlers(-1, playPrev)}
                  title="Tap for previous track, hold to rewind"
                  style={{ color: "white" }}
                >
                  <SkipBack size={24} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    width: "54px",
                    height: "54px",
                    borderRadius: "50%",
                    background: "white",
                    color: "black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 15px rgba(255,255,255,0.4)",
                  }}
                >
                  {isPlaying ? (
                    <Pause size={28} fill="currentColor" />
                  ) : (
                    <Play
                      size={28}
                      fill="currentColor"
                      style={{ marginLeft: "4px" }}
                    />
                  )}
                </button>
                <button
                  {...buildSeekHandlers(1, playNext)}
                  title="Tap for next track, hold to fast forward"
                  style={{ color: "white" }}
                >
                  <SkipForward size={24} />
                </button>
                <button
                  onClick={toggleRepeat}
                  style={{
                    color: repeat !== "none" ? "var(--primary)" : "var(--text-muted)",
                  }}
                >
                  <RepeatIcon size={20} />
                </button>
              </div>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                {formatTime(displayedProgress)} / {formatTime(effectiveDuration)}
              </div>
              <div className="music-player-hint">Tap skip for tracks, hold to seek</div>
            </div>

            <div className="music-player-side">
              {(currentSong.lyrics || syncedLines.length > 0) && (
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  style={{
                    color: showLyrics ? "var(--secondary)" : "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: showLyrics
                      ? "rgba(236,72,153,0.15)"
                      : "rgba(255,255,255,0.05)",
                    padding: "8px 16px",
                    borderRadius: "24px",
                    border: showLyrics
                      ? "1px solid var(--secondary)"
                      : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <FileText size={18} />
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      letterSpacing: "0.5px",
                    }}
                  >
                    LYRICS
                  </span>
                </button>
              )}

              <div className="music-player-volume">
                {muted ? (
                  <VolumeX size={18} onClick={() => setMuted(false)} />
                ) : (
                  <Volume2 size={18} onClick={() => setMuted(true)} />
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={(event) => {
                    setVolume(parseFloat(event.target.value));
                    setMuted(false);
                  }}
                  style={{ width: "80px", accentColor: "var(--primary)" }}
                />
              </div>

              <button
                className="icon-button"
                onClick={toggleCollapsed}
                aria-label="Minimize player"
              >
                <ChevronDown size={18} />
              </button>

              <X
                size={20}
                style={{
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  marginLeft: "8px",
                }}
                onClick={closePlayer}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;
