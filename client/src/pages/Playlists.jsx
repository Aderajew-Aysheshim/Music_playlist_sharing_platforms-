import { useState, useEffect } from 'react';
import { Trash2, Music, Download, Play, Plus } from 'lucide-react';
import api from '../api/axios';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const { data } = await api.get('playlists/');
      setPlaylists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName) return;
    try {
      await api.post('playlists/', { name: newPlaylistName });
      setNewPlaylistName('');
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePlaylist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await api.delete(`playlists/${id}/`);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const removeSong = async (playlistId, songId) => {
    try {
      await api.post(`playlists/${playlistId}/remove_song/`, { song_id: songId });
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-8" style={{ paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="heading" style={{ fontSize: '3rem', margin: 0 }}>My Playlists</h1>
      </div>

      <form onSubmit={createPlaylist} className="glass-panel p-6 mb-8 flex gap-4 items-center" style={{ borderRadius: '12px' }}>
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="New playlist name..."
          className="form-input"
          style={{ flex: 1, margin: 0 }}
        />
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Create
        </button>
      </form>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      ) : playlists.length === 0 ? (
        <div className="glass-panel p-8 text-center" style={{ color: 'var(--text-muted)' }}>
          You don't have any playlists yet.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {playlists.map(playlist => (
            <div key={playlist.id} className="glass-panel p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white' }}>{playlist.name}</h2>
                <button onClick={() => deletePlaylist(playlist.id)} className="btn-secondary" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: '#ef4444' }}>
                  <Trash2 size={18} />
                </button>
              </div>

              {playlist.songs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No songs in this playlist. Browse the home page to add some!</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {playlist.songs.map((song, i) => (
                    <div key={song.id} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <div className="flex items-center gap-4">
                        <div style={{ color: 'var(--text-muted)', width: '20px' }}>{i + 1}</div>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                          {song.cover_image ? <img src={song.cover_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Music size={16} style={{ color: 'var(--text-muted)' }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'white' }}>{song.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{song.artist}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={`http://127.0.0.1:8000/api/songs/${song.id}/stream/`} download className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                          <Download size={16} />
                        </a>
                        <button onClick={() => removeSong(playlist.id, song.id)} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;
