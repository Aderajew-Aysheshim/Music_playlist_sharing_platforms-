import { useEffect, useRef, useState, useMemo } from "react";
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
  const [lyricsTab, setLyricsTab] = useState("normal"); // 'normal' | 'practice'
  const progressRef = useRef(null);
  const lyricsContainerRef = useRef(null);

  const syncedLines = useMemo(() => {
    if (currentSong?.synced_lyrics) {
      // Split by newline and handle case where newlines are literal \n strings
      const rawText = currentSong.synced_lyrics.replace(/\\n/g, "\n");
      const lines = rawText
        .split(/\r?\n/)
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          // Match [mm:ss] or [mm:ss.xx]
          const match = trimmed.match(/\[(\d+):(\d+(\.\d+)?)\](.*)/);
          if (match) {
            const m = parseInt(match[1]);
            const s = parseFloat(match[2]);
            return { time: m * 60 + s, text: match[4].trim() };
          }

          // If no timestamp, give it a 0 time so it appears at start
          return { time: 0, text: trimmed };
        })
        .filter(Boolean)
        .sort((a, b) => a.time - b.time);

      return lines;
    } else {
      return [];
    }
  }, [currentSong]);

  // Parse synced lyrics when song changes
  useEffect(() => {
    setLyricsTab(syncedLines.length > 0 ? "practice" : "normal");
    setShowLyrics(false);
  }, [syncedLines]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMeta = () => setDuration(audio.duration);
    const onEnded = () => playNext();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [audioRef, playNext, setIsPlaying, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (audio.src !== currentSong.audio_file) {
      audio.src = currentSong.audio_file;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [audioRef, currentSong, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [audioRef, volume, muted]);

  if (!currentSong) return null;

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      {/* Lyrics Overlay Window */}
      {showLyrics && (currentSong.lyrics || syncedLines.length > 0) && (
        <div
          id="lyrics-overlay"
          className="glass-panel"
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
                      lyricsTab === "normal"
                        ? "var(--primary)"
                        : "var(--text-muted)",
                    borderBottom:
                      lyricsTab === "normal"
                        ? "2px solid var(--primary)"
                        : "none",
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
                {syncedLines.map((line, idx) => {
                  const isCurrent =
                    progress >= line.time &&
                    (idx === syncedLines.length - 1 ||
                      progress < syncedLines[idx + 1].time);

                  return (
                    <div
                      key={idx}
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
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: collapsed
            ? "translateY(calc(100% - 4px))"
            : "translateY(0)",
        }}
      >
        <button
          onClick={() =>
            setCollapsed((prev) => {
              const newVal = !prev;
              if (newVal) setShowLyrics(false);
              return newVal;
            })
          }
          style={{
            position: "absolute",
            top: "-24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(10,14,30,0.96)",
            border: "1px solid rgba(139,92,246,0.3)",
            borderBottom: "none",
            borderRadius: "12px 12px 0 0",
            padding: "4px 20px",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div
          ref={progressRef}
          onClick={handleProgressClick}
          style={{
            height: "4px",
            background: "rgba(255,255,255,0.1)",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background:
                "linear-gradient(90deg, var(--primary), var(--secondary))",
              transition: "width 0.1s linear",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
            padding: "0.75rem 2rem",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flex: 1,
              minWidth: 0,
            }}
          >
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
              {currentSong.cover_image ? (
                <img
                  src={currentSong.cover_image}
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              flex: 2,
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
            >
              <button
                onClick={toggleShuffle}
                style={{
                  color: shuffle ? "var(--primary)" : "var(--text-muted)",
                }}
              >
                <Shuffle size={20} />
              </button>
              <button onClick={playPrev} style={{ color: "white" }}>
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
              <button onClick={playNext} style={{ color: "white" }}>
                <SkipForward size={24} />
              </button>
              <button
                onClick={toggleRepeat}
                style={{
                  color:
                    repeat !== "none" ? "var(--primary)" : "var(--text-muted)",
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
              {formatTime(progress)} / {formatTime(duration)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setMuted(false);
                }}
                style={{ width: "80px", accentColor: "var(--primary)" }}
              />
            </div>
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
    </>
  );
};

export default MusicPlayer;
