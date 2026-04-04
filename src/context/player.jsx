import { createContext, useContext, useState, useRef, useCallback } from 'react';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // 'none' | 'one' | 'all'
  const audioRef = useRef(null);

  const currentSong = queue.length > 0 ? queue[currentIndex] : null;

  const playSong = useCallback((song, songList = null) => {
    if (songList) {
      const idx = songList.findIndex(s => s.id === song.id);
      setQueue(songList);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else {
      setQueue(prev => {
        const exists = prev.findIndex(s => s.id === song.id);
        if (exists >= 0) {
          setCurrentIndex(exists);
          return prev;
        }
        setCurrentIndex(prev.length);
        return [...prev, song];
      });
    }
    setIsPlaying(true);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    if (repeat === 'one') {
      audioRef.current?.play();
      return;
    }
    if (shuffle) {
      let next;
      do { next = Math.floor(Math.random() * queue.length); }
      while (queue.length > 1 && next === currentIndex);
      setCurrentIndex(next);
    } else {
      const next = currentIndex + 1;
      if (next >= queue.length) {
        if (repeat === 'all') {
          setCurrentIndex(0);
        } else {
          setIsPlaying(false);
          return;
        }
      } else {
        setCurrentIndex(next);
      }
    }
    setIsPlaying(true);
  }, [queue, currentIndex, shuffle, repeat]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    const prev = currentIndex - 1;
    if (prev < 0) {
      setCurrentIndex(queue.length - 1);
    } else {
      setCurrentIndex(prev);
    }
    setIsPlaying(true);
  }, [queue, currentIndex]);

  const toggleShuffle = () => setShuffle(s => !s);
  const toggleRepeat = () => setRepeat(r => r === 'none' ? 'all' : r === 'all' ? 'one' : 'none');

  const closePlayer = () => {
    setQueue([]);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider value={{
      queue, currentSong, currentIndex,
      isPlaying, setIsPlaying,
      shuffle, repeat,
      audioRef,
      playSong, playNext, playPrev,
      toggleShuffle, toggleRepeat,
      closePlayer,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};