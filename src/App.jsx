// App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PlayerProvider, usePlayer } from './context/Player';
import Playlists from './pages/Playlists';
import Upload from './pages/Upload';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import './App.css'; 


const MusicPlayer = () => {
  const { currentSong, isPlaying, audioRef, playNext, playPrev, setIsPlaying } = usePlayer();

  if (!currentSong) return null;

  return (
    <div className="music-player" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(24, 24, 27, 0.95)',
      padding: '0.5rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 50,
      color: 'white'
    }}>
      <audio
        ref={audioRef}
        src={currentSong.audio_file}
        autoPlay={isPlaying}
        onEnded={playNext}
      />
      <div style={{ flex: 1, marginLeft: '1rem' }}>
        <div style={{ fontWeight: 600 }}>{currentSong.title}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentSong.artist}</div>
      </div>
      <div className="player-controls" style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={playPrev} className="btn-secondary"><SkipBack size={20} /></button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="btn-secondary">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={playNext} className="btn-secondary"><SkipForward size={20} /></button>
      </div>
    </div>
  );
};

function App() {
  return (
    <PlayerProvider>
      <Router>
        <div className="app">
          
          <nav style={{
            display: 'flex',
            gap: '1rem',
            padding: '1rem 2rem',
            background: 'rgba(24, 24, 27, 0.95)',
            color: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'white', fontWeight: 600 }}>Home</Link>
            <Link to="/playlists" style={{ textDecoration: 'none', color: 'white', fontWeight: 600 }}>My Playlists</Link>
            <Link to="/upload" style={{ textDecoration: 'none', color: 'white', fontWeight: 600 }}>Upload</Link>
          </nav>

         
          <main style={{ padding: '2rem', paddingBottom: '120px' }}>
            <Routes>
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/" element={
                <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>
                  <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to Music App</h1>
                  <p>Upload songs, create playlists, and play music!</p>
                </div>
              } />
            </Routes>
          </main>

          
          <MusicPlayer />
        </div>
      </Router>
    </PlayerProvider>
  );
}

export default App;