import { Download, Link2, Music, Pause, Play, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '../api/axios';
import { normalizePlaylist } from '../api/adapters';
import { usePlayer } from '../context/PlayerContext';

const SharedPlaylist = () => {
  const { token } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { playSong, currentSong, isPlaying } = usePlayer();

  useEffect(() => {
    const fetchSharedPlaylist = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(`share/${token}/`);
        setPlaylist(normalizePlaylist(data));
      } catch (requestError) {
        console.error(requestError);
        setError('This shared playlist could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPlaylist();
  }, [token]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.error(copyError);
    }
  };

  if (loading) {
    return <div className="section-card">Loading shared playlist...</div>;
  }

  if (error || !playlist) {
    return <div className="section-card">{error || 'Playlist not found.'}</div>;
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="page-tag">
            <ShieldCheck size={14} />
            Shared access
          </span>
          <h1>{playlist.name}</h1>
          <p>Open this playlist from its share link.</p>
          <div className="metric-row">
            <span className="metric-pill">{playlist.songCount} songs</span>
            <span className="metric-pill">{playlist.ownerName || 'Shared by owner'}</span>
          </div>
        </div>

        <div className="hero-actions">
          <button className="btn-primary" onClick={handleCopy}>
            <Link2 size={18} />
            {copied ? 'Copied' : 'Copy share link'}
          </button>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Track list</p>
            <h2>Shared tracks</h2>
          </div>
        </div>

        <div className="playlist-song-list">
          {playlist.songs.map((song, index) => {
            const isActive = currentSong?.id === song.id;

            return (
              <article key={song.id} className="song-row">
                <div className="song-row-main">
                  <span className="song-row-index">
                    {song.order || index + 1}
                  </span>
                  <div className="song-art">
                    {song.coverImageUrl ? (
                      <img src={song.coverImageUrl} alt={song.title} />
                    ) : (
                      <Music size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className={isActive ? 'is-active' : ''}>{song.title}</h3>
                    <p>{song.artist}</p>
                  </div>
                </div>

                <div className="song-row-actions">
                  <button
                    className={isActive ? 'icon-button accent' : 'icon-button'}
                    onClick={() => playSong(song, playlist.songs)}
                  >
                    {isActive && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <a className="icon-button" href={song.playbackUrl} download>
                    <Download size={16} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SharedPlaylist;
