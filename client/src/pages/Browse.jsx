import {
  Compass,
  Download,
  Heart,
  ListMusic,
  Music,
  Pause,
  Play,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import api from '../api/axios';
import { getResults, normalizePlaylists } from '../api/adapters';
import PlaylistComments from '../components/PlaylistComments';
import { usePlayer } from '../context/PlayerContext';
import { getStoredUser, hasStoredAccessToken } from '../utils/session';

const Browse = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [commentsByPlaylist, setCommentsByPlaylist] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.trim() || '';

  const { playSong, currentSong, isPlaying } = usePlayer();
  const user = getStoredUser();
  const isAuthenticated = hasStoredAccessToken();

  useEffect(() => {
    fetchPublicPlaylists();
  }, [searchQuery]);

  const refreshPublicPlaylist = async (playlistId) => {
    try {
      const { data } = await api.get(`browse/${playlistId}/`);
      const normalized = normalizePlaylists([data])[0];
      setPlaylists((current) =>
        current.map((playlist) => (playlist.id === playlistId ? normalized : playlist)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPublicPlaylists = async () => {
    setLoading(true);

    try {
      const { data } = await api.get('browse/', {
        params: searchQuery ? { search: searchQuery } : undefined,
      });
      setPlaylists(normalizePlaylists(data));
    } catch (error) {
      console.error(error);
      setPlaylists([]);
    } finally {
      setExpandedId(null);
      setLoading(false);
    }
  };

  const fetchComments = async (playlistId) => {
    try {
      const { data } = await api.get(`playlists/${playlistId}/comments/`);
      setCommentsByPlaylist((current) => ({
        ...current,
        [playlistId]: getResults(data),
      }));
    } catch (error) {
      console.error(error);
      setCommentsByPlaylist((current) => ({
        ...current,
        [playlistId]: [],
      }));
    }
  };

  const toggleExpand = async (playlistId) => {
    const nextExpanded = expandedId === playlistId ? null : playlistId;
    setExpandedId(nextExpanded);

    if (nextExpanded) {
      await fetchComments(playlistId);
    }
  };

  const toggleLike = async (playlist) => {
    if (!isAuthenticated) {
      window.alert('Sign in to like playlists.');
      return;
    }

    try {
      const { data } = playlist.isLiked
        ? await api.delete(`playlists/${playlist.id}/like/`)
        : await api.post(`playlists/${playlist.id}/like/`);

      setPlaylists((current) =>
        current.map((item) =>
          item.id === playlist.id
            ? { ...item, isLiked: data.liked, likesCount: data.likes_count }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const addComment = async (playlistId) => {
    const content = (commentDrafts[playlistId] || '').trim();
    if (!content) {
      return;
    }

    try {
      await api.post(`playlists/${playlistId}/comments/`, { content });
      setCommentDrafts((current) => ({ ...current, [playlistId]: '' }));
      await fetchComments(playlistId);
      await refreshPublicPlaylist(playlistId);
    } catch (error) {
      console.error(error);
      window.alert('You need to be signed in to comment.');
    }
  };

  const deleteComment = async (playlistId, commentId) => {
    try {
      await api.delete(`playlists/${playlistId}/comments/${commentId}/`);
      await fetchComments(playlistId);
      await refreshPublicPlaylist(playlistId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="page-tag">
            <Compass size={14} />
            Public discovery
          </span>
          <h1>Explore public playlists created by the community.</h1>
          <p>
            Search public collections, preview tracks, like what stands out, and
            join the discussion when you are signed in.
          </p>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Community playlists</p>
            <h2>{searchQuery ? `Results for "${searchQuery}"` : 'Open playlists'}</h2>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading public playlists...</div>
        ) : playlists.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? 'No public playlists matched your search.' : 'No playlists are public yet.'}
          </div>
        ) : (
          <div className="playlist-stack">
            {playlists.map((playlist) => {
              const comments = commentsByPlaylist[playlist.id] || [];
              const isExpanded = expandedId === playlist.id;

              return (
                <article key={playlist.id} className="playlist-card">
                  <div className="playlist-card-header">
                    <button className="playlist-summary" onClick={() => toggleExpand(playlist.id)}>
                      <div className="playlist-summary-art">
                        <ListMusic size={18} />
                      </div>
                      <div className="playlist-summary-copy">
                        <h3>{playlist.name}</h3>
                        <p>{playlist.description || 'A public playlist ready for listening.'}</p>
                        <div className="chip-row">
                          <span className="metric-pill">{playlist.songCount} songs</span>
                          <span className="metric-pill">{playlist.likesCount} likes</span>
                          <span className="metric-pill">{playlist.commentsCount} comments</span>
                          <span className="metric-pill">
                            <User size={12} />
                            {playlist.ownerName || 'Community'}
                          </span>
                        </div>
                      </div>
                    </button>

                    <button
                      className={playlist.isLiked ? 'icon-button accent' : 'icon-button'}
                      onClick={() => toggleLike(playlist)}
                    >
                      <Heart size={16} />
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="playlist-detail-grid public">
                      <section className="detail-panel">
                        <div className="detail-panel-header">
                          <div>
                            <p className="section-kicker">Tracks</p>
                            <h4>Playable queue</h4>
                          </div>
                        </div>

                        <div className="playlist-song-list">
                          {playlist.songs.length ? playlist.songs.map((song, index) => {
                            const isActive = currentSong?.id === song.id;

                            return (
                              <article key={song.id} className="song-row">
                                <div className="song-row-main">
                                  <span className="song-row-index">{song.order || index + 1}</span>
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
                          }) : (
                            <div className="empty-inline">This playlist has no songs yet.</div>
                          )}
                        </div>
                      </section>

                      <PlaylistComments
                        comments={comments}
                        draft={commentDrafts[playlist.id] || ''}
                        currentUserId={user?.id}
                        ownerUsername={playlist.ownerName}
                        currentUsername={user?.username}
                        onDraftChange={(value) =>
                          setCommentDrafts((current) => ({
                            ...current,
                            [playlist.id]: value,
                          }))
                        }
                        onSubmit={() => addComment(playlist.id)}
                        onDelete={(commentId) => deleteComment(playlist.id, commentId)}
                      />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Browse;
