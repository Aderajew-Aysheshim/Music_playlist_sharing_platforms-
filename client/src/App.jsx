import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Playlists from './pages/Playlists';
import Upload from './pages/Upload';
import Browse from './pages/Browse';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import { usePlayer } from './context/PlayerContext';

function AppContent() {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const { currentSong } = usePlayer();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: currentSong ? '90px' : '0px' }}>
      <Navbar />
      <div className="container mt-8" style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/playlists" element={isAuthenticated ? <Playlists /> : <Navigate to="/login" />} />
          <Route path="/upload" element={isAuthenticated ? <Upload /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        </Routes>
      </div>
      <Footer />
      <MusicPlayer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
