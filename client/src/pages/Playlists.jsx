import {
  Copy,
  Globe,
  Heart,
  Lock,
  Music,
  Pause,
  Play,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api/axios';
import { getResults, normalizePlaylist, normalizeSongs } from '../api/adapters';
import PlaylistComments from '../components/PlaylistComments';
import PlaylistCollaborators from '../components/PlaylistCollaborators';
import { usePlayer } from '../context/PlayerContext';
import { getStoredUser } from '../utils/session';

const defaultPlaylistForm = {
  name: '',
  description: '',
  is_public: false,
};

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [playlistForm, setPlaylistForm] = useState(defaultPlaylistForm);
  const [settingsDrafts, setSettingsDrafts] = useState({});
  const [commentsByPlaylist, setCommentsByPlaylist] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [collaboratorsByPlaylist, setCollaboratorsByPlaylist] = useState({});
  const [collaboratorDrafts, setCollaboratorDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [addingSongsTo, setAddingSongsTo] = useState(null);
  const [songSearch, setSongSearch] = useState('');
  const [feedback, setFeedback] = useState('');

  const { playSong, currentSong, isPlaying } = usePlayer();
  const user = getStoredUser();

  useEffect(() => {
    fetchLibrary();
  }, []);

  const setPageFeedback = (message) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 2400);
  };

  const hydratePlaylistState = (detailedPlaylists) => {
    setPlaylists(detailedPlaylists);
    setSettingsDrafts(
      Object.fromEntries(
        detailedPlaylists.map((playlist) => [
          playlist.id,
          {
            name: playlist.name,
            description: playlist.description || '',
            is_public: playlist.isPublic,
          },
        ]),
      ),
    );
    setCollaboratorsByPlaylist((current) => ({
      ...current,
      ...Object.fromEntries(
        detailedPlaylists
          .filter((playlist) => playlist.userRole === 'owner')
          .map((playlist) => [playlist.id, playlist.collaborators || []]),
      ),
    }));
  };

  const loadPlaylistDetails = async (playlistSummaries) => {
    if (!playlistSummaries.length) {
      return [];
    }

    return Promise.all(
      playlistSummaries.map(async (playlist) => {
        try {
          const detailResponse = await api.get(`playlists/${playlist.id}/`);
          return normalizePlaylist(detailResponse.data);
        } catch (detailError) {
          console.error(detailError);
          return normalizePlaylist(playlist);
        }
      }),
    );
  };

  const fetchLibrary = async () => {
    setLoading(true);

    try {
      const [playlistResponse, songsResponse] = await Promise.all([
        api.get('playlists/'),
        api.get('songs/'),
      ]);

      const playlistSummaries = getResults(playlistResponse.data);
      const detailedPlaylists = await loadPlaylistDetails(playlistSummaries);
      hydratePlaylistState(detailedPlaylists);
      setAllSongs(normalizeSongs(songsResponse.data));
    } catch (error) {
      console.error(error);
      setPlaylists([]);
      setAllSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshPlaylist = async (playlistId) => {
    try {
      const { data } = await api.get(`playlists/${playlistId}/`);
      const normalized = normalizePlaylist(data);
      setPlaylists((current) =>
        current.map((playlist) => (playlist.id === playlistId ? normalized : playlist)),
      );
      setSettingsDrafts((current) => ({
        ...current,
        [playlistId]: {
          name: normalized.name,
          description: normalized.description || '',
          is_public: normalized.isPublic,
        },
      }));

      if (normalized.userRole === 'owner') {
        setCollaboratorsByPlaylist((current) => ({
          ...current,
          [playlistId]: normalized.collaborators || [],
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createPlaylist = async (event) => {
    event.preventDefault();
    if (!playlistForm.name.trim()) {
      return;
    }

    try {
      await api.post('playlists/', {
        name: playlistForm.name.trim(),
        description: playlistForm.description.trim(),
        is_public: playlistForm.is_public,
      });
      setPlaylistForm(defaultPlaylistForm);
      setPageFeedback('Playlist created.');
      fetchLibrary();
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not create the playlist.');
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('Delete this playlist permanently?')) {
      return;
    }

    try {
      await api.delete(`playlists/${playlistId}/`);
      setPlaylists((current) => current.filter((playlist) => playlist.id !== playlistId));
      if (expandedId === playlistId) {
        setExpandedId(null);
      }
      if (addingSongsTo === playlistId) {
        setAddingSongsTo(null);
      }
      setPageFeedback('Playlist deleted.');
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not delete the playlist.');
    }
  };

  const savePlaylistSettings = async (playlistId) => {
    try {
      await api.patch(`playlists/${playlistId}/`, settingsDrafts[playlistId]);
      await refreshPlaylist(playlistId);
      setPageFeedback('Playlist settings saved.');
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not save playlist settings.');
    }
  };

  const addSong = async (playlistId, songId) => {
    try {
      await api.post(`playlists/${playlistId}/add_song/`, { song_id: songId });
      await refreshPlaylist(playlistId);
      setPageFeedback('Song added to playlist.');
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not add this song.');
    }
  };

  const removeSong = async (playlistId, songId) => {
    try {
      await api.post(`playlists/${playlistId}/remove_song/`, { song_id: songId });
      await refreshPlaylist(playlistId);
      setPageFeedback('Song removed from playlist.');
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not remove this song.');
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

  const addComment = async (playlistId) => {
    const content = (commentDrafts[playlistId] || '').trim();
    if (!content) {
      return;
    }

    try {
      await api.post(`playlists/${playlistId}/comments/`, { content });
      setCommentDrafts((current) => ({ ...current, [playlistId]: '' }));
      await fetchComments(playlistId);
      await refreshPlaylist(playlistId);
      setPageFeedback('Comment posted.');
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not post the comment.');
    }
  };

  const deleteComment = async (playlistId, commentId) => {
    try {
      await api.delete(`playlists/${playlistId}/comments/${commentId}/`);
      await fetchComments(playlistId);
      await refreshPlaylist(playlistId);
      setPageFeedback('Comment removed.');
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not delete the comment.');
    }
  };

  const fetchCollaborators = async (playlistId) => {
    try {
      const { data } = await api.get(`playlists/${playlistId}/collaborators/`);
      setCollaboratorsByPlaylist((current) => ({
        ...current,
        [playlistId]: getResults(data),
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const addCollaborator = async (playlistId) => {
    const draft = collaboratorDrafts[playlistId] || { username: '', role: 'viewer' };
    if (!draft.username.trim()) {
      return;
    }

    try {
      await api.post(`playlists/${playlistId}/collaborators/`, {
        username: draft.username.trim(),
        role: draft.role,
      });
      setCollaboratorDrafts((current) => ({
        ...current,
        [playlistId]: { username: '', role: 'viewer' },
      }));
      await fetchCollaborators(playlistId);
      await refreshPlaylist(playlistId);
      setPageFeedback('Collaborator added.');
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not add that collaborator.');
    }
  };

  const updateCollaboratorRole = async (playlistId, collaboratorId, role) => {
    try {
      await api.put(`playlists/${playlistId}/collaborators/${collaboratorId}/`, { role });
      await fetchCollaborators(playlistId);
      await refreshPlaylist(playlistId);
      setPageFeedback('Collaborator role updated.');
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not update the collaborator role.');
    }
  };

  const removeCollaborator = async (playlistId, collaboratorId) => {
    try {
      await api.delete(`playlists/${playlistId}/collaborators/${collaboratorId}/`);
      await fetchCollaborators(playlistId);
      await refreshPlaylist(playlistId);
      setPageFeedback('Collaborator removed.');
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not remove that collaborator.');
    }
  };

  const toggleLike = async (playlist) => {
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
      setPageFeedback('Could not update likes right now.');
    }
  };

  const toggleExpand = async (playlistId) => {
    const nextExpanded = expandedId === playlistId ? null : playlistId;
    setExpandedId(nextExpanded);

    if (nextExpanded) {
      await fetchComments(playlistId);
      const playlist = playlists.find((item) => item.id === playlistId);
      if (playlist?.userRole === 'owner') {
        await fetchCollaborators(playlistId);
      }
    }
  };

  const toggleAddSongs = (playlistId) => {
    setAddingSongsTo(addingSongsTo === playlistId ? null : playlistId);
    setSongSearch('');
  };

  const copyShareLink = async (playlist) => {
    const shareLink = playlist.shareToken
      ? `${window.location.origin}/shared/${playlist.shareToken}`
      : playlist.shareUrl;

    if (!shareLink) {
      setPageFeedback('Share link is not available for this playlist.');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setPageFeedback('Share link copied.');
    } catch (error) {
      console.error(error);
      setPageFeedback('Could not copy the share link.');
    }
  };

  const visibleSongsByPlaylist = useMemo(
    () =>
      Object.fromEntries(
        playlists.map((playlist) => {
          const existingIds = new Set((playlist.songs || []).map((song) => song.id));
          const filteredSongs = allSongs.filter((song) => {
            if (existingIds.has(song.id)) {
              return false;
            }

            const query = songSearch.toLowerCase();
            return (
              song.title.toLowerCase().includes(query)
              || song.artist.toLowerCase().includes(query)
            );
          });

          return [playlist.id, filteredSongs];
        }),
      ),
    [allSongs, playlists, songSearch],
  );

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="page-tag">
            <Music size={14} />
            Library workspace
          </span>
          <h1>Manage your playlists.</h1>
          <p>Create, edit, share, and collaborate from one place.</p>
          <div className="metric-row">
            <span className="metric-pill">{playlists.length} playlists</span>
            <span className="metric-pill">
              {playlists.filter((playlist) => playlist.isPublic).length} public
            </span>
            <span className="metric-pill">
              {playlists.filter((playlist) => playlist.userRole === 'editor').length} editor collaborations
            </span>
          </div>
        </div>

        <form className="create-panel" onSubmit={createPlaylist}>
          <div className="section-heading compact">
            <div>
              <p className="section-kicker">New playlist</p>
              <h2>Create a fresh collection</h2>
            </div>
          </div>

          <input
            className="form-input"
            type="text"
            placeholder="Weekend run mix"
            value={playlistForm.name}
            onChange={(event) =>
              setPlaylistForm((current) => ({ ...current, name: event.target.value }))
            }
          />
          <textarea
            className="form-input"
            placeholder="Add a short description"
            value={playlistForm.description}
            onChange={(event) =>
              setPlaylistForm((current) => ({ ...current, description: event.target.value }))
            }
          />
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={playlistForm.is_public}
              onChange={(event) =>
                setPlaylistForm((current) => ({ ...current, is_public: event.target.checked }))
              }
            />
            <span>Make this playlist public immediately</span>
          </label>
          <button className="btn-primary" type="submit">
            <Plus size={16} />
            Create playlist
          </button>
          {feedback ? <p className="feedback-text">{feedback}</p> : null}
        </form>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Your playlists</p>
            <h2>Owned and shared with you</h2>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading your library...</div>
        ) : playlists.length === 0 ? (
          <div className="empty-state">You do not have any playlists yet.</div>
        ) : (
          <div className="playlist-stack">
            {playlists.map((playlist) => {
              const isExpanded = expandedId === playlist.id;
              const canEditSongs = playlist.userRole === 'owner' || playlist.userRole === 'editor';
              const isOwner = playlist.userRole === 'owner';
              const comments = commentsByPlaylist[playlist.id] || [];
              const collaborators = collaboratorsByPlaylist[playlist.id] || playlist.collaborators || [];
              const collaboratorDraft = collaboratorDrafts[playlist.id] || { username: '', role: 'viewer' };
              const settings = settingsDrafts[playlist.id] || {
                name: playlist.name,
                description: playlist.description || '',
                is_public: playlist.isPublic,
              };

              return (
                <article key={playlist.id} className="playlist-card">
                  <div className="playlist-card-header">
                    <button className="playlist-summary" onClick={() => toggleExpand(playlist.id)}>
                      <div className="playlist-summary-art">
                        {playlist.playlistCoverImageUrl ? (
                          <img src={playlist.playlistCoverImageUrl} alt={playlist.name} />
                        ) : playlist.isPublic ? (
                          <Globe size={18} />
                        ) : (
                          <Lock size={18} />
                        )}
                      </div>
                      <div className="playlist-summary-copy">
                        <h3>{playlist.name}</h3>
                        <p>{playlist.description || 'No description yet.'}</p>
                        <div className="chip-row">
                          <span className="metric-pill">{playlist.songCount} songs</span>
                          <span className="metric-pill">{playlist.likesCount} likes</span>
                          <span className="metric-pill">{playlist.commentsCount} comments</span>
                          <span className="metric-pill">{playlist.collaboratorsCount} collaborators</span>
                          <span className="metric-pill">{playlist.userRole || 'viewer'}</span>
                        </div>
                      </div>
                    </button>

                    <div className="playlist-header-actions">
                      <button
                        className={playlist.isLiked ? 'icon-button accent' : 'icon-button'}
                        onClick={() => toggleLike(playlist)}
                      >
                        <Heart size={16} />
                      </button>
                      {isOwner ? (
                        <>
                          <button className="icon-button" onClick={() => copyShareLink(playlist)}>
                            <Copy size={16} />
                          </button>
                          <button className="icon-button danger" onClick={() => deletePlaylist(playlist.id)}>
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="playlist-detail-grid">
                      <section className="detail-panel">
                        <div className="detail-panel-header">
                          <div>
                            <p className="section-kicker">Tracks</p>
                            <h4>Ordered playlist songs</h4>
                          </div>
                          {canEditSongs ? (
                            <button
                              className="btn-secondary compact"
                              onClick={() => toggleAddSongs(playlist.id)}
                            >
                              {addingSongsTo === playlist.id ? <X size={16} /> : <Plus size={16} />}
                              {addingSongsTo === playlist.id ? 'Close' : 'Add songs'}
                            </button>
                          ) : null}
                        </div>

                        {addingSongsTo === playlist.id && canEditSongs ? (
                          <div className="embedded-panel">
                            <div className="search-shell">
                              <Search size={16} />
                              <input
                                type="text"
                                placeholder="Search uploaded songs"
                                value={songSearch}
                                onChange={(event) => setSongSearch(event.target.value)}
                              />
                            </div>
                            <div className="inline-list">
                              {(visibleSongsByPlaylist[playlist.id] || []).length ? (
                                visibleSongsByPlaylist[playlist.id].map((song) => (
                                  <div key={song.id} className="mini-row">
                                    <div>
                                      <strong>{song.title}</strong>
                                      <span>{song.artist}</span>
                                    </div>
                                    <button className="btn-primary compact" onClick={() => addSong(playlist.id, song.id)}>
                                      <Plus size={14} />
                                      Add
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <div className="empty-inline">No available songs match this search.</div>
                              )}
                            </div>
                          </div>
                        ) : null}

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
                                  {canEditSongs ? (
                                    <button
                                      className="icon-button danger"
                                      onClick={() => removeSong(playlist.id, song.id)}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  ) : null}
                                </div>
                              </article>
                            );
                          }) : (
                            <div className="empty-inline">No songs in this playlist yet.</div>
                          )}
                        </div>
                      </section>

                      <div className="detail-sidebar">
                        <section className="detail-panel">
                          <div className="detail-panel-header">
                            <div>
                              <p className="section-kicker">Details</p>
                              <h4>Visibility and sharing</h4>
                            </div>
                          </div>

                          {isOwner ? (
                            <>
                              <input
                                className="form-input"
                                value={settings.name}
                                onChange={(event) =>
                                  setSettingsDrafts((current) => ({
                                    ...current,
                                    [playlist.id]: {
                                      ...settings,
                                      name: event.target.value,
                                    },
                                  }))
                                }
                              />
                              <textarea
                                className="form-input"
                                value={settings.description}
                                onChange={(event) =>
                                  setSettingsDrafts((current) => ({
                                    ...current,
                                    [playlist.id]: {
                                      ...settings,
                                      description: event.target.value,
                                    },
                                  }))
                                }
                              />
                              <label className="toggle-row">
                                <input
                                  type="checkbox"
                                  checked={settings.is_public}
                                  onChange={(event) =>
                                    setSettingsDrafts((current) => ({
                                      ...current,
                                      [playlist.id]: {
                                        ...settings,
                                        is_public: event.target.checked,
                                      },
                                    }))
                                  }
                                />
                                <span>Public playlist</span>
                              </label>
                              <button className="btn-primary compact" onClick={() => savePlaylistSettings(playlist.id)}>
                                <Save size={16} />
                                Save changes
                              </button>
                              {playlist.shareToken ? (
                                <Link className="btn-secondary compact" to={`/shared/${playlist.shareToken}`}>
                                  <Copy size={16} />
                                  Open shared view
                                </Link>
                              ) : null}
                            </>
                          ) : (
                            <div className="info-stack">
                              <span className="metric-pill">
                                {playlist.isPublic ? 'Public' : 'Private'}
                              </span>
                              <p>Role: {playlist.userRole}.</p>
                            </div>
                          )}
                        </section>

                        {isOwner ? (
                          <PlaylistCollaborators
                            collaborators={collaborators}
                            draft={collaboratorDraft}
                            onDraftChange={(nextDraft) =>
                              setCollaboratorDrafts((current) => ({
                                ...current,
                                [playlist.id]: nextDraft,
                              }))
                            }
                            onAdd={() => addCollaborator(playlist.id)}
                            onRoleChange={(collaboratorId, role) =>
                              updateCollaboratorRole(playlist.id, collaboratorId, role)
                            }
                            onRemove={(collaboratorId) =>
                              removeCollaborator(playlist.id, collaboratorId)
                            }
                          />
                        ) : null}

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

export default Playlists;
