import { useState, useEffect } from 'react';
import { Trash2, Music, Download, Play, Plus, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [addingSongsTo, setAddingSongsTo] = useState(null); // playlist id for the add-song panel
  const [songSearch, setSongSearch] = useState('');
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    fetchPlaylists();
    fetchAllSongs();
  }, []);

  const fetchAllSongs = async () => {
    try {
      const { data } = await api.get('songs/');
      setAllSongs(data);
      const unique = [...new Set(data.map(s => s.artist))].filter(Boolean);
      setArtists(unique);
    } catch (err) {
      console.error(err);
    }
  };

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
      await api.post('playlists/', { name: newPlaylistName, artist: selectedArtist });
      setNewPlaylistName('');
      setSelectedArtist('');
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePlaylist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await api.delete(`playlists/${id}/`);
      if (expandedId === id) setExpandedId(null);
      if (addingSongsTo === id) setAddingSongsTo(null);
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const addSong = async (playlistId, songId) => {
    try {
      await api.post(`playlists/${playlistId}/add_song/`, { song_id: songId });
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

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);
  const toggleAddSongs = (id) => {
    setAddingSongsTo(addingSongsTo === id ? null : id);
    setSongSearch('');
  };

  const getFilteredSongs = (playlist) => {
    const existingIds = new Set(playlist.songs.map(s => s.id));
    return allSongs.filter(s =>
      !existingIds.has(s.id) &&
      (s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
       s.artist.toLowerCase().includes(songSearch.toLowerCase()))
    );
  };

  return (
    <div style={{ paddingBottom: currentSong ? '120px' : '40px' }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="heading" style={{ fontSize: '3rem', margin: 0 }}>My Playlists</h1>
      </div>

      {/* Create playlist form */}
      <form onSubmit={createPlaylist} className="glass-panel p-6 mb-8 flex flex-wrap gap-4 items-center" style={{ borderRadius: '12px' }}>
        <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="New playlist name..."
          className="form-input"
          style={{ flex: 1, margin: 0, minWidth: '200px' }}
        />
        {artists.length > 0 && (
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="form-input"
            style={{ flex: 1, margin: 0, minWidth: '200px', cursor: 'pointer' }}
          >
            <option value="">Auto-fill from Artist (Optional)</option>
            {artists.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
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
            <div key={playlist.id} className="glass-panel" style={{ overflow: 'hidden' }}>
              {/* Playlist header */}
              <div className="flex justify-between items-center p-6">
                <div className="flex items-center gap-4" style={{ flex: 1, cursor: 'pointer' }} onClick={() => toggleExpand(playlist.id)}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Music size={22} color="white" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', margin: 0 }}>{playlist.name}</h2>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    {expandedId === playlist.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAddSongs(playlist.id)}
                    className="btn-primary flex items-center gap-2"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    <Plus size={16} /> Add Songs
                  </button>
                  <button
                    onClick={() => deletePlaylist(playlist.id)}
                    style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Add Songs Panel */}
              {addingSongsTo === playlist.id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', background: 'rgba(139,92,246,0.05)' }}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 style={{ color: 'var(--primary)', fontWeight: 600, margin: 0 }}>Add songs to "{playlist.name}"</h3>
                    <button onClick={() => setAddingSongsTo(null)} style={{ color: 'var(--text-muted)', display: 'flex' }}><X size={20}/></button>
                  </div>
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search songs or artists..."
                      value={songSearch}
                      onChange={(e) => setSongSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                  </div>
                  <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {getFilteredSongs(playlist).length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                        {allSongs.length === 0 ? 'No songs uploaded yet.' : 'All songs already in playlist or no matches found.'}
                      </p>
                    ) : (
                      getFilteredSongs(playlist).map(song => (
                        <div key={song.id} className="flex items-center justify-between p-3 rounded" style={{ background: 'rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                          <div className="flex items-center gap-3">
                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {song.cover_image ? <img src={song.cover_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Music size={16} style={{ color: 'var(--text-muted)' }} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, color: 'white', fontSize: '0.9rem' }}>{song.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{song.artist}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => addSong(playlist.id, song.id)}
                            className="btn-primary flex items-center gap-1"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Songs in playlist */}
              {expandedId === playlist.id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem 1.5rem 1.5rem' }}>
                  {playlist.songs.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
                      No songs yet — click "Add Songs" above!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2" style={{ marginTop: '0.75rem' }}>
                      {playlist.songs.map((song, i) => (
                        <div key={song.id} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                          <div className="flex items-center gap-4">
                            <span style={{ color: 'var(--text-muted)', width: '22px', textAlign: 'center', fontSize: '0.85rem' }}>{i + 1}</span>
                            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--surface-hover)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                            <a href={`http://127.0.0.1:8000/api/songs/${song.id}/stream/`} download className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
                              <Download size={16} />
                            </a>
                            <button onClick={() => removeSong(playlist.id, song.id)} style={{ padding: '0.4rem', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sticky Audio Player */}
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
          <button onClick={() => setCurrentSong(null)} style={{ color: 'var(--text-muted)', flexShrink: 0 }}><X size={20} /></button>
        </div>
      )}
    </div>
  );
};

export default Playlists;
