import { useState, useEffect } from 'react';
import { Play, Download, Plus, Disc3, Music, FileText } from 'lucide-react';
import api from '../api/axios';
import { usePlayer } from '../context/PlayerContext';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLyrics, setExpandedLyrics] = useState(null); // track song ID for lyrics

  const { playSong, currentSong, isPlaying } = usePlayer();
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

  const handlePlay = (song) => {
    playSong(song, songs);
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

  const toggleLyrics = (songId) => {
    setExpandedLyrics(expandedLyrics === songId ? null : songId);
  };

  return (
    <div>
      <header className="mb-8 p-8 glass-panel text-center">
        <h1 className="heading" style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>Discover Endless Vibes</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Stream, download, and build the ultimate playlist.</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Disc3 className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
        </div>
      ) : songs.length === 0 ? (
        <div className="glass-panel p-8 text-center" style={{ color: 'var(--text-muted)' }}>
          No songs uploaded yet. <a href="/upload" style={{ color: 'var(--primary)' }}>Upload the first one!</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {songs.map(song => {
            const isActive = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                className="glass-panel p-4 flex flex-col justify-between"
                style={{
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  border: isActive ? '1px solid rgba(139,92,246,0.7)' : undefined,
                  boxShadow: isActive ? '0 0 20px rgba(139,92,246,0.25)' : undefined,
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="flex gap-4 items-center mb-4">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    flexShrink: 0,
                    backgroundColor: 'var(--surface-hover)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {song.cover_image ? (
                      <img src={song.cover_image} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Music size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    )}
                    {isActive && isPlaying && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(139,92,246,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div className="now-playing-bars">
                          <span /><span /><span />
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '1.1rem', fontWeight: 600, color: isActive ? 'var(--primary)' : '#fff',
                      marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{song.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{song.artist}</p>
                  </div>
                </div>

                {song.lyrics && expandedLyrics === song.id && (
                  <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '0.85rem', color: 'var(--text-muted)', maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                    {song.lyrics}
                  </div>
                )}

                <div className="flex justify-between items-center mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex gap-2">
                    <button
                      id={`play-song-${song.id}`}
                      onClick={() => handlePlay(song)}
                      className="btn-primary"
                      style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Play size={20} />
                    </button>

                    {song.lyrics && (
                       <button
                         onClick={() => toggleLyrics(song.id)}
                         className="btn-secondary"
                         title={expandedLyrics === song.id ? "Hide Lyrics" : "Show Lyrics"}
                         style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: expandedLyrics === song.id ? 'var(--primary)' : 'inherit', border: expandedLyrics === song.id ? '1px solid var(--primary)' : '1px solid var(--border)' }}
                       >
                         <FileText size={18} />
                       </button>
                    )}
                  </div>

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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
