import {
  Compass,
  Disc3,
  Download,
  FileText,
  Music,
  Play,
  Plus,
  Share2,
  UploadCloud,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api/axios';
import { normalizePlaylists, normalizeSongs } from '../api/adapters';
import { usePlayer } from '../context/PlayerContext';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLyrics, setExpandedLyrics] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const { playSong, currentSong, isPlaying } = usePlayer();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);

      try {
        const requests = [
          api.get('songs/'),
          api.get('browse/'),
        ];

        if (token) {
          requests.push(api.get('playlists/'));
        }

        const [songsResponse, publicPlaylistsResponse, playlistsResponse] = await Promise.all(requests);
        setSongs(normalizeSongs(songsResponse.data));
        setPublicPlaylists(normalizePlaylists(publicPlaylistsResponse.data));
        setPlaylists(playlistsResponse ? normalizePlaylists(playlistsResponse.data) : []);
      } catch (error) {
        console.error(error);
        setSongs([]);
        setPlaylists([]);
        setPublicPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [token]);

  const latestSongs = useMemo(() => songs.slice(0, 8), [songs]);
  const featuredPlaylists = useMemo(() => publicPlaylists.slice(0, 4), [publicPlaylists]);

  const addToPlaylist = async (songId, playlistId) => {
    try {
      await api.post(`playlists/${playlistId}/add_song/`, { song_id: songId });
      setOpenDropdown(null);
      window.alert('Song added to playlist.');
    } catch (error) {
      console.error(error);
      window.alert('Unable to add this song to the selected playlist.');
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="page-tag">Welcome</span>
          <h1>Discover Music</h1>
          <p>Upload, share, and enjoy playlists</p>
          <div className="metric-row">
            <span className="metric-pill">{publicPlaylists.length} public playlists</span>
            <span className="metric-pill">{playlists.length} playlists in your library</span>
          </div>
        </div>

        <div className="hero-grid">
          <div className="spotlight-card accent">
            <div className="spotlight-icon">
              <Share2 size={20} />
            </div>
            <h2>Share instantly</h2>
            <p>Create playlists and share links</p>
          </div>
          <div className="spotlight-card">
            <div className="spotlight-icon">
              <Compass size={20} />
            </div>
            <h2>Discover</h2>
            <p>Browse public playlists</p>
          </div>
          <div className="spotlight-card">
            <div className="spotlight-icon">
              <UploadCloud size={20} />
            </div>
            <h2>Upload</h2>
            <p>Share tracks with lyrics</p>
          </div>
        </div>
      </section >

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Latest tracks</p>
            <h2>Recent Uploads</h2>
          </div>
          <Link to="/upload" className="btn-secondary compact">
            <UploadCloud size={16} />
            Upload
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : latestSongs.length === 0 ? (
          <div className="empty-state">
            <Music size={48} />
            <h3>No songs yet</h3>
            <p>Be the first to share music!</p>
            <Link to="/upload" className="btn-primary">
              <UploadCloud size={16} />
              Upload
            </Link>
          </div>
        ) : (
          <div className="song-card-grid">
            {latestSongs.map((song) => {
              const isActive = currentSong?.id === song.id;

              return (
                <article key={song.id} className="song-card">
                  <div className="song-card-media">
                    {song.coverImageUrl ? (
                      <img src={song.coverImageUrl} alt={song.title} />
                    ) : (
                      <Music size={30} />
                    )}
                    {isActive && isPlaying ? (
                      <div className="song-card-overlay">
                        <div className="now-playing-bars">
                          <span /><span /><span />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="song-card-body">
                    <div>
                      <h3>{song.title}</h3>
                      <p>{song.artist}</p>
                    </div>

                    {song.lyrics && expandedLyrics === song.id ? (
                      <div className="lyrics-preview">{song.lyrics}</div>
                    ) : null}

                    <div className="song-card-actions">
                      <button
                        className="btn-primary compact"
                        onClick={() => playSong(song, songs)}
                      >
                        <Play size={16} />
                        Play
                      </button>

                      <a className="icon-button" href={song.playbackUrl} download>
                        <Download size={16} />
                      </a>

                      {song.lyrics ? (
                        <button
                          className="icon-button"
                          onClick={() => setExpandedLyrics(expandedLyrics === song.id ? null : song.id)}
                        >
                          <FileText size={16} />
                        </button>
                      ) : null}

                      {token ? (
                        <div className="dropdown-shell">
                          <button
                            className="icon-button"
                            onClick={() => setOpenDropdown(openDropdown === song.id ? null : song.id)}
                          >
                            <Plus size={16} />
                          </button>
                          {openDropdown === song.id ? (
                            <div className="dropdown-panel">
                              {playlists.length ? playlists.map((playlist) => (
                                <button
                                  key={playlist.id}
                                  className="dropdown-item"
                                  onClick={() => addToPlaylist(song.id, playlist.id)}
                                >
                                  {playlist.name}
                                </button>
                              )) : (
                                <span className="dropdown-empty">Create a playlist first.</span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Public discovery</p>
            <h2>Featured Playlists</h2>
          </div>
          <Link to="/browse" className="btn-secondary compact">
            <Compass size={16} />
            Browse
          </Link>
        </div>

        {featuredPlaylists.length === 0 ? (
          <div className="empty-state">
            <Compass size={48} />
            <h3>No playlists yet</h3>
            <p>Create and share playlists!</p>
            <Link to="/playlists" className="btn-primary">
              <Plus size={16} />
              Create
            </Link>
          </div>
        ) : (
          <div className="feature-grid">
            {featuredPlaylists.map((playlist) => (
              <article key={playlist.id} className="feature-card">
                <div className="feature-card-header">
                  <span className="page-tag subtle">{playlist.isPublic ? 'Public' : 'Private'}</span>
                  <span className="metric-pill">{playlist.songCount} songs</span>
                </div>
                <h3>{playlist.name}</h3>
                <p>{playlist.description || 'Curated playlist'}</p>
                <div className="feature-card-footer">
                  <span>{playlist.ownerName || 'Community playlist'}</span>
                  <span>{playlist.likesCount} likes</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div >
  );
};

export default Home;
