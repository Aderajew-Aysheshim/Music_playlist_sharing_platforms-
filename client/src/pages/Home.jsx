import { useState, useEffect } from 'react';
import { Play, Download, Plus, Pause, Disc3, CloudDrizzle, Navigation, Navigation2 } from 'lucide-react';
import api from '../api/axios';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSongs();
    if (token) fetchPlaylists();
  }, [token]);

  const fetchSongs = async () => {
    try {
      const { data } = await api.get('songs/');
      setSongs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const { data } = await api.get('playlists/');
      setPlaylists(data);
    } catch (err) {
      console.error(err);
    }
  };

  const playSong = (song) => {
    setCurrentSong(song);
  };

  const addToPlaylist = async (songId, playlistId) => {
    try {
      await api.post(`playlists/${playlistId}/add_song/`, { song_id: songId });
      alert('Song added to playlist!');
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginBottom: currentSong ? '120px' : '20px' }}>
      <header className="mb-8 p-8 glass-panel text-center">
        <h1 className="heading" style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>Discover Endless Vibes</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Stream, download, and build the ultimate playlist.</p>
      </header>
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Disc3 className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {songs.map(song => (
            <div key={song.id} className="glass-panel p-4 flex flex-col justify-between" style={{ transition: 'transform 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="flex gap-4 items-center mb-4">
                <div style={{ width: '80px', height: '80px', flexShrink: 0, backgroundColor: 'var(--surface-hover)', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {song.cover_image ? (
                    <img src={song.cover_image} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Music size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{song.artist}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button 
                  onClick={() => playSong(song)}
                  className="btn-primary" 
                  style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Play size={20} />
                </button>
                
                <div className="flex gap-2">
                  <a 
                    href={`http://127.0.0.1:8000/api/songs/${song.id}/stream/`} 
                    download
                    className="btn-secondary"
                    style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Download size={18} />
                  </a>

                  {token && (
                    <div style={{ position: 'relative' }} className="playlist-dropdown">
                      <button 
                        className="btn-secondary"
                        style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={(e) => {
                          const dropdown = e.currentTarget.nextElementSibling;
                          dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                        }}
                      >
                        <Plus size={18} />
                      </button>
                      <div className="glass-panel" style={{ display: 'none', position: 'absolute', right: 0, bottom: '120%', minWidth: '150px', zIndex: 10, padding: '0.5rem' }}>
                        {playlists.length > 0 ? playlists.map(pl => (
                          <div key={pl.id} className="p-2 hover:bg-white/10 rounded cursor-pointer text-sm" onClick={() => addToPlaylist(song.id, pl.id)}>
                            {pl.name}
                          </div>
                        )) : (
                          <div className="p-2 text-sm text-gray-400">No playlists</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentSong && (
        <div className="glass-panel" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '800px', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', zIndex: 50, borderRadius: '999px', backdropFilter: 'blur(20px)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--surface-hover)' }}>
             {currentSong.cover_image ? <img src={currentSong.cover_image} style={{width: '100%', height:'100%', objectFit: 'cover'}}/> : <Music size={24} style={{margin:'12px', color:'var(--text-muted)'}}/>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentSong.artist}</div>
          </div>
          <div style={{ flex: 2 }}>
            <audio src={currentSong.audio_file} controls autoPlay controlsList="nodownload" style={{ width: '100%', height: '36px' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
