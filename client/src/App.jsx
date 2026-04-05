import PlaylistDetail from './pages/PlaylistDetail';
import SearchResults from './pages/SearchResults';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { usePlayer } from './context/PlayerContext';
import Browse from './pages/Browse';
import Home from './pages/Home';
import Login from './pages/Login';
import Playlists from './pages/Playlists';
import Register from './pages/Register';
import SharedPlaylist from './pages/SharedPlaylist';
import Upload from './pages/Upload';
import { hasStoredAccessToken } from './utils/session';

function AppContent() {
  const isAuthenticated = hasStoredAccessToken();
  const { currentSong } = usePlayer();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div
      className="app-shell"
      style={{ paddingBottom: currentSong ? '118px' : '0px' }}
    >
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar} />
      <Sidebar className={sidebarOpen ? 'open' : ''} onClose={closeSidebar} />
      <div className="app-main">
        <Navbar>
          <button className="mobile-menu-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </Navbar>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route
              path="/playlists"
              element={isAuthenticated ? <Playlists /> : <Navigate to="/login" />}
            />
            <Route
              path="/upload"
              element={isAuthenticated ? <Upload /> : <Navigate to="/login" />}
            />
            <Route path="/shared/:token" element={<SharedPlaylist />} />
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
            />
           
            
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </main>
        <Footer />
      </div>
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
