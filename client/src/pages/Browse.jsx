import { useState, useEffect } from 'react';
import { Music, Play, Download, User, ListMusic } from 'lucide-react';
import api from '../api/axios';

const Browse = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    fetchPublicPlaylists();
  }, []);

  const fetchPublicPlaylists = async () => {
    try {
      const { data } = await api.get('browse/');
      setPlaylists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ paddingBottom: currentSong ? '120px' : '20px' }}>
      <header className="mb-8 p-8 glass-panel text-center">
        <h1 className="heading" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Browse Playlists</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Explore playlists created by the MusiConnect community</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div style={{ color: 'var(--text-muted)' }}>Loading playlists...</div>
        </div>
      ) : playlists.length === 0 ? (
        <div className="glass-panel p-8 text-center" style={{ color: 'var(--text-muted)' }}>
          No playlists have been created yet. Be the first!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {playlists.map(playlist => (
            <div key={playlist.id} className="glass-panel" style={{ overflow: 'hidden', transition: 'transform 0.2s' }}>
              <div 
                className="flex justify-between items-center p-6" 
                style={{ cursor: 'pointer' }} 
                onClick={() => toggleExpand(playlist.id)}
              >
                <div className="flex items-center gap-4">
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ListMusic size={24} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>{playlist.name}</h3>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <User size={14} /> {playlist.owner_name} &bull; {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)', transform: expandedId === playlist.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>
                  ▼
                </div>
              </div>

              {expandedId === playlist.id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem 1.5rem 1.5rem' }}>
                  {playlist.songs.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: '1rem 0', fontSize: '0.875rem' }}>This playlist has no songs yet.</p>
                  ) : (
                    playlist.songs.map((song, i) => (
                      <div key={song.id} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                        <div className="flex items-center gap-4">
                          <span style={{ color: 'var(--text-muted)', width: '24px', textAlign: 'center', fontSize: '0.85rem' }}>{i + 1}</span>
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {song.cover_image ? <img src={song.cover_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Music size={16} style={{ color: 'var(--text-muted)' }} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'white' }}>{song.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{song.artist}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setCurrentSong(song)} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                            <Play size={16} />
                          </button>
                          <a href={`http://127.0.0.1:8000/api/songs/${song.id}/stream/`} download className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                            <Download size={16} />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {currentSong && (
        <div className="glass-panel" style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '800px', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', zIndex: 50, borderRadius: '999px', backdropFilter: 'blur(20px)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--surface-hover)', flexShrink: 0 }}>
            {currentSong.cover_image ? <img src={currentSong.cover_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Music size={24} style={{ margin: '12px', color: 'var(--text-muted)' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentSong.artist}</div>
          </div>
          <div style={{ flex: 2 }}>
            <audio src={currentSong.audio_file} controls autoPlay style={{ width: '100%', height: '36px' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Browse;
