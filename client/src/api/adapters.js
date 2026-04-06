import { API_BASE_URL } from './config';

const toAbsoluteUrl = (value) => {
  if (!value) {
    return null;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return new URL(value, API_BASE_URL).toString();
};

export const getResults = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.results ?? [];
};

export const normalizeSong = (song) => {
  if (!song) {
    return null;
  }

  return {
    ...song,
    audio_file: toAbsoluteUrl(song.audio_file),
    cover_image: toAbsoluteUrl(song.cover_image),
    stream_url: toAbsoluteUrl(song.stream_url),
    playbackUrl: toAbsoluteUrl(song.stream_url) || toAbsoluteUrl(song.audio_file),
    coverImageUrl: toAbsoluteUrl(song.cover_image),
  };
};

export const normalizeSongs = (payload) => getResults(payload)
  .map(normalizeSong)
  .filter(Boolean);

export const flattenPlaylistSongs = (entries = []) => entries
  .map((entry) => {
    const song = normalizeSong(entry?.song ?? entry);
    if (!song) {
      return null;
    }

    return {
      ...song,
      order: entry?.order ?? song.order ?? null,
      playlistSongId: entry?.id ?? song.playlistSongId ?? null,
    };
  })
  .filter(Boolean);

const getPlaylistCoverImageUrl = (songs = []) => {
  if (!songs.length) {
    return null;
  }

  const latestCoveredSong = songs.reduce((latest, song) => {
    if (!song?.coverImageUrl) {
      return latest;
    }

    if (!latest) {
      return song;
    }

    const latestEntryId = latest.playlistSongId ?? -1;
    const currentEntryId = song.playlistSongId ?? -1;

    if (currentEntryId > latestEntryId) {
      return song;
    }

    if (currentEntryId === latestEntryId && (song.order ?? 0) > (latest.order ?? 0)) {
      return song;
    }

    return latest;
  }, null);

  return latestCoveredSong?.coverImageUrl ?? null;
};

export const normalizePlaylist = (playlist) => {
  if (!playlist) {
    return null;
  }

  const songs = flattenPlaylistSongs(playlist.songs || []);
  const songsCount = playlist.songs_count ?? songs.length ?? 0;
  const likesCount = playlist.likes_count ?? 0;
  const commentsCount = playlist.comments_count ?? 0;
  const collaboratorsCount = playlist.collaborators_count ?? 0;

  return {
    ...playlist,
    songs,
    ownerName: playlist.owner_name ?? '',
    songCount: songsCount,
    likesCount,
    commentsCount,
    collaboratorsCount,
    isPublic: Boolean(playlist.is_public),
    isLiked: Boolean(playlist.is_liked),
    userRole: playlist.user_role ?? null,
    shareToken: playlist.share_token ?? null,
    shareUrl: playlist.share_url ?? null,
    collaborators: playlist.collaborators ?? [],
    playlistCoverImageUrl: getPlaylistCoverImageUrl(songs),
  };
};

export const normalizePlaylists = (payload) => getResults(payload)
  .map(normalizePlaylist)
  .filter(Boolean);
